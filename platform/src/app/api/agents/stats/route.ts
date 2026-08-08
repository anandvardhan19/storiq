import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'

export async function GET() {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  if (session!.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [tasksByAgent, tasksByStatus, recentRuns, totals] = await Promise.all([
    db.agentTask.groupBy({
      by: ['agent', 'status'],
      _count: { id: true },
      _avg: { durationMs: true, tokensUsed: true },
      orderBy: { agent: 'asc' },
    }),

    db.agentTask.groupBy({
      by: ['status'],
      _count: { id: true },
    }),

    db.agentRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),

    db.agentTask.aggregate({
      _count: { id: true },
      _sum: { tokensUsed: true, durationMs: true },
      _avg: { durationMs: true },
    }),
  ])

  // Reshape per-agent stats
  const agentMap: Record<string, any> = {}
  for (const row of tasksByAgent) {
    if (!agentMap[row.agent]) agentMap[row.agent] = { agent: row.agent, tasks: {}, avgDurationMs: 0, avgTokens: 0 }
    agentMap[row.agent].tasks[row.status] = row._count.id
    if (row.status === 'DONE') {
      agentMap[row.agent].avgDurationMs = Math.round(row._avg.durationMs ?? 0)
      agentMap[row.agent].avgTokens = Math.round(row._avg.tokensUsed ?? 0)
    }
  }

  return NextResponse.json({
    totals: {
      tasks: totals._count.id,
      tokensUsed: totals._sum.tokensUsed ?? 0,
      avgDurationMs: Math.round(totals._avg.durationMs ?? 0),
    },
    byStatus: tasksByStatus.map((s) => ({ status: s.status, count: s._count.id })),
    byAgent: Object.values(agentMap),
    recentRuns,
  })
}
