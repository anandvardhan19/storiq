import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const [stores, users, products, categories, customers, orders, orderItems,
    staff, attendance, suppliers, warehouses, inventory, payments,
    fulfillments, discounts, reviews] = await Promise.all([
    db.store.findMany(),
    db.user.findMany({ select: { id: true, email: true, name: true, role: true, storeId: true, createdAt: true } }),
    db.product.findMany(),
    db.category.findMany(),
    db.customer.findMany(),
    db.order.findMany(),
    db.orderItem.findMany(),
    db.staffMember.findMany(),
    db.attendance.findMany(),
    db.supplier.findMany(),
    db.warehouse.findMany(),
    db.inventoryItem.findMany(),
    db.payment.findMany(),
    db.fulfillment.findMany(),
    db.discount.findMany(),
    db.review.findMany(),
  ])

  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    app: 'Storiq',
    data: {
      stores, users, products, categories, customers, orders, orderItems,
      staff, attendance, suppliers, warehouses, inventory, payments,
      fulfillments, discounts, reviews,
    },
  }

  const filename = `storiq-backup-${new Date().toISOString().slice(0, 10)}.json`
  const body = JSON.stringify(backup, null, 2)

  await db.backupLog.create({
    data: { type: 'local', filename, sizeBytes: Buffer.byteLength(body), status: 'success' },
  })

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
