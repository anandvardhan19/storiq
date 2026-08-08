import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth, paginate } from '@/lib/api'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.any().optional(),
  gstin: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const sp = req.nextUrl.searchParams
  const { skip, take } = paginate(sp)

  const customer = await db.customer.findFirst({
    where: { id, storeId: session!.user.storeId! },
  })
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const orders = await db.order.findMany({
    where: { customerId: id, storeId: session!.user.storeId! },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  })

  return NextResponse.json({ ...customer, orders })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const existing = await db.customer.findFirst({
    where: { id, storeId: session!.user.storeId! },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const customer = await db.customer.update({
      where: { id },
      data: { ...data, tags: data.tags !== undefined ? JSON.stringify(data.tags) : undefined },
    })
    return NextResponse.json(customer)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const existing = await db.customer.findFirst({
    where: { id, storeId: session!.user.storeId! },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.customer.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
