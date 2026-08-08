import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth, paginate } from '@/lib/api'
import { slugify } from '@/lib/utils'

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  costPrice: z.number().min(0).default(0),
  sellingPrice: z.number().min(0),
  mrp: z.number().optional(),
  taxRate: z.number().min(0).max(100).default(18),
  unit: z.string().default('piece'),
  tags: z.array(z.string()).default([]),
  imageUrls: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const sp = req.nextUrl.searchParams
  const { skip, take } = paginate(sp)
  const search = sp.get('search') ?? ''
  const categoryId = sp.get('categoryId') ?? undefined

  const where = {
    storeId: session!.user.storeId!,
    isActive: sp.get('inactive') ? undefined : true,
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    ...(categoryId && { categoryId }),
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        inventory: { select: { quantity: true, warehouseId: true } },
        _count: { select: { variants: true } },
      },
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({ products, total })
}

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const storeId = session!.user.storeId!

    const slug = slugify(data.name) + '-' + Math.random().toString(36).substring(2, 6)

    const product = await db.product.create({
      data: { ...data, storeId, slug },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
