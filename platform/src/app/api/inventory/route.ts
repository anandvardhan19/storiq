import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth, paginate } from '@/lib/api'

const adjustSchema = z.object({
  inventoryItemId: z.string(),
  type: z.enum(['PURCHASE', 'ADJUSTMENT', 'DAMAGE', 'RETURN', 'TRANSFER']),
  quantity: z.number().int(), // positive or negative
  note: z.string().optional(),
  reference: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const sp = req.nextUrl.searchParams
  const { skip, take } = paginate(sp)
  const lowStock = sp.get('lowStock') === 'true'
  const warehouseId = sp.get('warehouseId') ?? undefined
  const search = sp.get('search') ?? ''

  const items = await db.inventoryItem.findMany({
    where: {
      product: {
        storeId: session!.user.storeId!,
        isActive: true,
        ...(search && { name: { contains: search } }),
      },
      ...(warehouseId && { warehouseId }),
    },
    skip,
    take,
    include: {
      product: { select: { id: true, name: true, sku: true, imageUrls: true, sellingPrice: true } },
      variant: { select: { id: true, name: true, sku: true } },
      warehouse: { select: { id: true, name: true } },
    },
    orderBy: { quantity: 'asc' },
  })

  // Apply lowStock filter post-query (can't easily reference self column in where)
  const filtered = lowStock ? items.filter((i) => i.quantity <= i.reorderPoint) : items

  return NextResponse.json({ items: filtered, total: filtered.length })
}

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  try {
    const body = await req.json()
    const data = adjustSchema.parse(body)
    const storeId = session!.user.storeId!

    // Verify the inventory item belongs to this store
    const inv = await db.inventoryItem.findFirst({
      where: { id: data.inventoryItemId, product: { storeId } },
    })
    if (!inv) return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })

    const [updated] = await db.$transaction([
      db.inventoryItem.update({
        where: { id: data.inventoryItemId },
        data: {
          quantity: { increment: data.quantity },
          ...(data.quantity > 0 && data.type === 'PURCHASE' ? { lastRestockedAt: new Date() } : {}),
        },
      }),
      db.stockMovement.create({
        data: {
          inventoryItemId: data.inventoryItemId,
          type: data.type,
          quantity: data.quantity,
          note: data.note,
          reference: data.reference,
          createdById: session!.user.id,
        },
      }),
    ])

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
