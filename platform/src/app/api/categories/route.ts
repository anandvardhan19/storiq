import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'
import { slugify } from '@/lib/utils'

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const categories = await db.category.findMany({
    where: { storeId: session!.user.storeId! },
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const storeId = session!.user.storeId!

    const slug = slugify(data.name) + '-' + Math.random().toString(36).substring(2, 5)

    const category = await db.category.create({
      data: { ...data, storeId, slug },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
