import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type BackupData = {
  version: string
  exportedAt: string
  app: string
  data: Record<string, unknown[]>
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text()
    const backup: BackupData = JSON.parse(text)

    if (backup.app !== 'Storiq' || !backup.data) {
      return NextResponse.json({ error: 'Invalid Storiq backup file' }, { status: 400 })
    }

    const { data } = backup

    // Restore in dependency order: clear then re-insert
    await db.$transaction(async (tx) => {
      // Clear all tables (reverse dependency order)
      await tx.backupLog.deleteMany()
      await tx.auditLog.deleteMany()
      await tx.attendance.deleteMany()
      await tx.shiftAssignment.deleteMany()
      await tx.shift.deleteMany()
      await tx.staffMember.deleteMany()
      await tx.review.deleteMany()
      await tx.fulfillment.deleteMany()
      await tx.payment.deleteMany()
      await tx.orderItem.deleteMany()
      await tx.order.deleteMany()
      await tx.discount.deleteMany()
      await tx.stockMovement.deleteMany()
      await tx.inventoryItem.deleteMany()
      await tx.productVariant.deleteMany()
      await tx.product.deleteMany()
      await tx.category.deleteMany()
      await tx.supplier.deleteMany()
      await tx.warehouse.deleteMany()
      await tx.storeSettings.deleteMany()
      await tx.session.deleteMany()
      await tx.customer.deleteMany()
      await tx.user.deleteMany()
      await tx.store.deleteMany()

      // Re-insert
      if (data.stores?.length)      await tx.store.createMany({ data: data.stores as never[] })
      if (data.users?.length)        await tx.user.createMany({ data: data.users as never[], skipDuplicates: true })
      if (data.customers?.length)    await tx.customer.createMany({ data: data.customers as never[] })
      if (data.suppliers?.length)    await tx.supplier.createMany({ data: data.suppliers as never[] })
      if (data.warehouses?.length)   await tx.warehouse.createMany({ data: data.warehouses as never[] })
      if (data.categories?.length)   await tx.category.createMany({ data: data.categories as never[] })
      if (data.products?.length)     await tx.product.createMany({ data: data.products as never[] })
      if (data.inventory?.length)    await tx.inventoryItem.createMany({ data: data.inventory as never[] })
      if (data.discounts?.length)    await tx.discount.createMany({ data: data.discounts as never[] })
      if (data.orders?.length)       await tx.order.createMany({ data: data.orders as never[] })
      if (data.orderItems?.length)   await tx.orderItem.createMany({ data: data.orderItems as never[] })
      if (data.payments?.length)     await tx.payment.createMany({ data: data.payments as never[] })
      if (data.fulfillments?.length) await tx.fulfillment.createMany({ data: data.fulfillments as never[] })
      if (data.staff?.length)        await tx.staffMember.createMany({ data: data.staff as never[] })
      if (data.attendance?.length)   await tx.attendance.createMany({ data: data.attendance as never[] })
      if (data.reviews?.length)      await tx.review.createMany({ data: data.reviews as never[] })
    })

    return NextResponse.json({ ok: true, message: 'Database restored successfully.' })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
