import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth, paginate } from '@/lib/api'

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.any().optional(),
  gstin: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const sp = req.nextUrl.searchParams
  const { skip, take } = paginate(sp)
  const search = sp.get('search') ?? ''

  const where = {
    storeId: session!.user.storeId!,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      skip,
      take,
      orderBy: { totalSpent: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        loyaltyPts: true,
        totalSpent: true,
        orderCount: true,
        tags: true,
        createdAt: true,
      },
    }),
    db.customer.count({ where }),
  ])

  return NextResponse.json({ customers, total })
}

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const storeId = session!.user.storeId!

    const customer = await db.customer.create({ data: { ...data, storeId } })
    return NextResponse.json(customer, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
