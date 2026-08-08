import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionOrUnauth } from '@/lib/api'

export async function GET(req: NextRequest) {
  const { session, error } = await getSessionOrUnauth()
  if (error) return error

  const storeId = session!.user.storeId!
  const sp = req.nextUrl.searchParams
  const range = sp.get('range') ?? '30' // days
  const days = Math.min(365, Math.max(1, parseInt(range)))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [
    totalRevenue,
    orderCount,
    newCustomers,
    topProducts,
    revenueByDay,
    ordersByStatus,
    lowStockCount,
  ] = await Promise.all([
    // Total revenue in range
    db.order.aggregate({
      where: { storeId, createdAt: { gte: since }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    }),

    // Order count
    db.order.count({
      where: { storeId, createdAt: { gte: since }, status: { not: 'CANCELLED' } },
    }),

    // New customers
    db.customer.count({ where: { storeId, createdAt: { gte: since } } }),

    // Top 5 products by revenue
    db.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: { order: { storeId, createdAt: { gte: since }, status: { not: 'CANCELLED' } } },
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),

    // Daily revenue (raw query for grouping by date)
    db.$queryRaw<{ date: string; revenue: number; orders: number }[]>`
      SELECT
        DATE("createdAt") as date,
        SUM(total)::float as revenue,
        COUNT(*)::int as orders
      FROM "Order"
      WHERE "storeId" = ${storeId}
        AND "createdAt" >= ${since}
        AND status != 'CANCELLED'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,

    // Orders by status
    db.order.groupBy({
      by: ['status'],
      where: { storeId, createdAt: { gte: since } },
      _count: { status: true },
    }),

    // Low stock items
    db.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int as count FROM "InventoryItem" i
      JOIN "Product" p ON p.id = i."productId"
      WHERE p."storeId" = ${storeId} AND i.quantity <= i."reorderPoint"
    `,
  ])

  return NextResponse.json({
    revenue: totalRevenue._sum.total ?? 0,
    orderCount,
    newCustomers,
    topProducts,
    revenueByDay,
    ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count.status })),
    lowStockCount: lowStockCount[0]?.count ?? 0,
  })
}
