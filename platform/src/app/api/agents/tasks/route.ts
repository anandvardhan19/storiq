import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'

const createSchema = z.object({
  agent: z.string().toUpperCase(),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
})

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  if (session!.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sp = req.nextUrl.searchParams
  const agent = sp.get('agent') ?? undefined
  const status = sp.get('status') ?? undefined

  const tasks = await db.agentTask.findMany({
    where: {
      ...(agent && { agent }),
      ...(status && { status: status as any }),
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json({ tasks })
}

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  if (session!.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()

    // Support bulk create
    const items = Array.isArray(body) ? body : [body]
    const parsed = items.map((i) => createSchema.parse(i))

    const tasks = await db.$transaction(
      parsed.map((d) => db.agentTask.create({ data: d }))
    )

    return NextResponse.json({ tasks }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
