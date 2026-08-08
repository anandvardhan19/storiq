import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'

const updateSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'FAILED', 'SKIPPED']).optional(),
  result: z.string().optional(),
  errorMsg: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  tokensUsed: z.number().optional(),
  durationMs: z.number().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  if (session!.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const extra: Record<string, any> = {}
    if (data.status === 'IN_PROGRESS') extra.startedAt = new Date()
    if (data.status === 'DONE' || data.status === 'FAILED') extra.completedAt = new Date()

    const task = await db.agentTask.update({
      where: { id: params.id },
      data: { ...data, ...extra },
    })
    return NextResponse.json(task)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  if (session!.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.agentTask.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
