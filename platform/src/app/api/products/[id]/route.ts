import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  mrp: z.number().optional().nullable(),
  taxRate: z.number().min(0).max(100).optional(),
  unit: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

async function getProduct(id: string, storeId: string) {
  return db.product.findFirst({ where: { id, storeId } })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const product = await db.product.findFirst({
    where: { id, storeId: session!.user.storeId! },
    include: {
      category: true,
      supplier: true,
      variants: true,
      inventory: { include: { warehouse: { select: { id: true, name: true } } } },
    },
  })

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const existing = await getProduct(id, session!.user.storeId!)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)
    const product = await db.product.update({ where: { id }, data })
    return NextResponse.json(product)
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

  const existing = await getProduct(id, session!.user.storeId!)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.product.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
