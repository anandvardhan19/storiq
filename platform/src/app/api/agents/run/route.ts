import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'

const client = new Anthropic()
const AGENTS_DIR = path.join(process.cwd(), '..', 'agents')

function loadAgentPersona(agentName: string): string {
  const filePath = path.join(AGENTS_DIR, `${agentName.toUpperCase()}.md`)
  if (existsSync(filePath)) return readFileSync(filePath, 'utf-8')
  return `You are ${agentName}, an AI agent for the Chhayavastralaya SMB commerce platform.`
}

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  if (session!.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { agents, taskIds } = body as { agents?: string[]; taskIds?: string[] }

  // Fetch tasks to run
  const where = taskIds?.length
    ? { id: { in: taskIds }, status: 'TODO' as const }
    : { status: 'TODO' as const, ...(agents?.length ? { agent: { in: agents } } : {}) }

  const tasks = await db.agentTask.findMany({
    where,
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  if (tasks.length === 0) {
    return NextResponse.json({ message: 'No TODO tasks found', results: [] })
  }

  const run = await db.agentRun.create({
    data: {
      agentsRun: Array.from(new Set(tasks.map((t) => t.agent))),
      tasksTotal: tasks.length,
    },
  })

  const runStart = Date.now()
  const results = []

  // Run tasks — parallel per agent, sequential within agent
  const byAgent = tasks.reduce<Record<string, typeof tasks>>((acc, t) => {
    acc[t.agent] = acc[t.agent] ?? []
    acc[t.agent].push(t)
    return acc
  }, {})

  const agentResults = await Promise.all(
    Object.entries(byAgent).map(async ([agentName, agentTasks]) => {
      const persona = loadAgentPersona(agentName)
      const agentOut = []

      for (const task of agentTasks) {
        const taskStart = Date.now()

        await db.agentTask.update({
          where: { id: task.id },
          data: { status: 'IN_PROGRESS', startedAt: new Date() },
        })

        try {
          const response = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
            system: persona,
            messages: [
              {
                role: 'user',
                content: `# Task: ${task.title}\n\n${task.description}\n\nDeliver your output as markdown. Be concise and actionable.`,
              },
            ],
          })

          const result = response.content
            .filter((b) => b.type === 'text')
            .map((b) => (b as any).text)
            .join('\n')

          const durationMs = Date.now() - taskStart
          const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

          await db.agentTask.update({
            where: { id: task.id },
            data: {
              status: 'DONE',
              result,
              completedAt: new Date(),
              durationMs,
              tokensUsed,
            },
          })

          agentOut.push({ taskId: task.id, agent: agentName, title: task.title, status: 'DONE', durationMs, tokensUsed, result })
        } catch (err: any) {
          await db.agentTask.update({
            where: { id: task.id },
            data: { status: 'FAILED', errorMsg: err.message, completedAt: new Date() },
          })
          agentOut.push({ taskId: task.id, agent: agentName, title: task.title, status: 'FAILED', error: err.message })
        }
      }

      return agentOut
    })
  )

  results.push(...agentResults.flat())

  const done = results.filter((r) => r.status === 'DONE').length
  const failed = results.filter((r) => r.status === 'FAILED').length

  await db.agentRun.update({
    where: { id: run.id },
    data: {
      tasksDone: done,
      tasksFailed: failed,
      completedAt: new Date(),
      durationMs: Date.now() - runStart,
    },
  })

  return NextResponse.json({
    runId: run.id,
    stats: {
      total: tasks.length,
      done,
      failed,
      durationMs: Date.now() - runStart,
      tokensUsed: results.reduce((s, r) => s + (r.tokensUsed ?? 0), 0),
    },
    results,
  })
}
