import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSessionOrUnauth, paginate } from '@/lib/api'

const orderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  productName: z.string(),
  variantName: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).default(0),
  taxAmt: z.number().min(0).default(0),
  discountAmt: z.number().min(0).default(0),
  total: z.number().min(0),
})

const createSchema = z.object({
  customerId: z.string().optional(),
  paymentMethod: z.string().optional(),
  source: z.enum(['POS', 'ONLINE', 'WHATSAPP', 'PHONE']).default('POS'),
  subtotal: z.number().min(0),
  discountAmt: z.number().min(0).default(0),
  taxAmt: z.number().min(0).default(0),
  shippingAmt: z.number().min(0).default(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  shippingAddr: z.any().optional(),
  discountId: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
})

function genOrderNumber(storeSlug: string) {
  const ts = Date.now().toString(36).toUpperCase()
  return `${storeSlug.slice(0, 4).toUpperCase()}-${ts}`
}

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const sp = req.nextUrl.searchParams
  const { skip, take } = paginate(sp)
  const status = sp.get('status') ?? undefined
  const search = sp.get('search') ?? ''

  const where = {
    storeId: session!.user.storeId!,
    ...(status && { status: status as string }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' as const } },
        { customer: { name: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: { select: { id: true, productName: true, quantity: true, total: true } },
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ])

  return NextResponse.json({ orders, total })
}

export async function POST(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const storeId = session!.user.storeId!

    const store = await db.store.findUnique({ where: { id: storeId }, select: { slug: true } })
    const orderNumber = genOrderNumber(store?.slug ?? 'ORD')

    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          storeId,
          orderNumber,
          customerId: data.customerId,
          paymentMethod: data.paymentMethod,
          source: data.source,
          subtotal: data.subtotal,
          discountAmt: data.discountAmt,
          taxAmt: data.taxAmt,
          shippingAmt: data.shippingAmt,
          total: data.total,
          notes: data.notes,
          shippingAddr: data.shippingAddr,
          discountId: data.discountId,
          items: { create: data.items },
        },
        include: { items: true, customer: true },
      })

      // Deduct inventory for each item
      for (const item of data.items) {
        const invWhere = item.variantId
          ? { productId_variantId_warehouseId: undefined }
          : undefined

        // Find default warehouse inventory (scoped to this store)
        const inv = await tx.inventoryItem.findFirst({
          where: {
            productId: item.productId,
            variantId: item.variantId ?? null,
            product: { storeId },
          },
        })

        if (inv) {
          await tx.inventoryItem.update({
            where: { id: inv.id },
            data: { quantity: { decrement: item.quantity } },
          })
          await tx.stockMovement.create({
            data: {
              inventoryItemId: inv.id,
              type: 'SALE',
              quantity: -item.quantity,
              reference: orderNumber,
            },
          })
        }
      }

      // Update customer stats (verify customer belongs to this store)
      if (data.customerId) {
        const customer = await tx.customer.findFirst({
          where: { id: data.customerId, storeId },
        })
        if (!customer) throw new Error('Customer not found or does not belong to this store')
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            totalSpent: { increment: data.total },
            orderCount: { increment: 1 },
          },
        })
      }

      return created
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
