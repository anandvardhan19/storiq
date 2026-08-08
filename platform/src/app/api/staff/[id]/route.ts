import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'

const updateSchema = z.object({
  designation: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().optional(),
  employeeId: z.string().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['MANAGER', 'CASHIER', 'WAREHOUSE_STAFF', 'VIEWER']).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const member = await db.staffMember.findFirst({
    where: { id: params.id, storeId: session!.user.storeId! },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true, avatar: true } },
      attendance: { orderBy: { date: 'desc' }, take: 30 },
    },
  })

  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(member)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const requesterRole = session!.user.role
  if (requesterRole !== 'OWNER' && requesterRole !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.staffMember.findFirst({
    where: { id: params.id, storeId: session!.user.storeId! },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const { role, ...staffData } = data

    await db.$transaction(async (tx) => {
      await tx.staffMember.update({ where: { id: params.id }, data: staffData })
      if (role) await tx.user.update({ where: { id: existing.userId }, data: { role } })
    })

    const updated = await db.staffMember.findUnique({
      where: { id: params.id },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    })

    return NextResponse.json(updated)
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

  const existing = await db.staffMember.findFirst({
    where: { id: params.id, storeId: session!.user.storeId! },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.staffMember.update({ where: { id: params.id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
