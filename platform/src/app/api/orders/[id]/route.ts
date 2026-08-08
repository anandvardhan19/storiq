import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED']).optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  shippingAddr: z.any().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const order = await db.order.findFirst({
    where: { id: params.id, storeId: session!.user.storeId! },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrls: true } },
          variant: { select: { id: true, name: true } },
        },
      },
      customer: true,
      payments: true,
      fulfillments: true,
      discount: true,
      staff: { include: { user: { select: { name: true } } } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const existing = await db.order.findFirst({
    where: { id: params.id, storeId: session!.user.storeId! },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const order = await db.order.update({ where: { id: params.id }, data })
    return NextResponse.json(order)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const existing = await db.order.findFirst({
    where: { id: params.id, storeId: session!.user.storeId! },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.order.update({
    where: { id: params.id },
    data: { status: 'CANCELLED' },
  })
  return NextResponse.json({ success: true })
}
