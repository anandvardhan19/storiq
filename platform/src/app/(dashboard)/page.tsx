'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface AnalyticsData {
  revenue: number
  orderCount: number
  newCustomers: number
  lowStockCount: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
  customer: { name: string } | null
}

interface InventoryItem {
  id: string
  quantity: number
  reorderPoint: number
  product: { name: string; sku: string }
  warehouse: { name: string }
}

const STATUS_VARIANT: Record<string, BadgeProps['variant']> = {
  PENDING: 'warning',
  CONFIRMED: 'default',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'secondary',
}

function SkeletonStat() {
  return (
    <div className="bg-surface-900 border border-white/5 rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 bg-white/5 rounded-lg" />
      </div>
      <div className="h-7 bg-white/5 rounded w-20 mb-1.5" />
      <div className="h-3 bg-white/5 rounded w-28" />
    </div>
  )
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        const [analyticsRes, ordersRes, lowStockRes, pendingRes] = await Promise.all([
          fetch('/api/analytics?range=30'),
          fetch('/api/orders?take=5'),
          fetch('/api/inventory?lowStock=true&take=5'),
          fetch('/api/orders?status=PENDING&take=1'),
        ])

        if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
        if (ordersRes.ok) {
          const d = await ordersRes.json()
          setRecentOrders(d.orders ?? [])
        }
        if (lowStockRes.ok) {
          const d = await lowStockRes.json()
          setLowStockItems(d.items ?? [])
        }
        if (pendingRes.ok) {
          const d = await pendingRes.json()
          setPendingCount(d.total ?? 0)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">
          {greeting} 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {"Here's what's happening with your store today."}
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
          {[...Array(6)].map((_, i) => <SkeletonStat key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
          <StatCard
            label="Revenue (30 days)"
            value={formatCurrency(analytics?.revenue ?? 0)}
            icon={TrendingUp}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
          <StatCard
            label="Orders (30 days)"
            value={(analytics?.orderCount ?? 0).toString()}
            sub={`${pendingCount} pending`}
            icon={ShoppingCart}
          />
          <StatCard
            label="New Customers"
            value={(analytics?.newCustomers ?? 0).toString()}
            icon={Users}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
          />
          <StatCard
            label="Pending Orders"
            value={pendingCount.toString()}
            icon={Clock}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <StatCard
            label="Low Stock Alerts"
            value={(analytics?.lowStockCount ?? 0).toString()}
            icon={AlertTriangle}
            iconColor="text-red-400"
            iconBg="bg-red-500/10"
          />
          <StatCard
            label="Low Stock (inventory)"
            value={(lowStockItems.length).toString()}
            icon={Package}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/orders" className="text-brand-400 text-xs hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </CardHeader>
          {loading ? (
            <div className="divide-y divide-white/5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-white/5 rounded animate-pulse w-28" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-20" />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <div className="h-4 bg-white/5 rounded animate-pulse w-16" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-14" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="px-5 py-10 text-center text-white/30 text-sm">No orders yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-white text-sm font-mono font-medium">{order.orderNumber}</div>
                    <div className="text-white/40 text-xs mt-0.5">
                      {order.customer?.name ?? 'Walk-in customer'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-semibold">{formatCurrency(order.total)}</div>
                    <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="mt-0.5">
                      {order.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="justify-between">
            <CardTitle>Low Stock Alerts</CardTitle>
            <Link href="/inventory?lowStock=true" className="text-brand-400 text-xs hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </CardHeader>
          {loading ? (
            <div className="divide-y divide-white/5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-white/5 rounded animate-pulse w-32" />
                    <div className="h-3 bg-white/5 rounded animate-pulse w-20" />
                  </div>
                  <div className="h-6 bg-white/5 rounded-full animate-pulse w-16" />
                </div>
              ))}
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="px-5 py-10 text-center text-white/30 text-sm">
              <AlertTriangle size={28} className="text-emerald-400/30 mx-auto mb-2" />
              All items are well stocked
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {lowStockItems.map((item) => (
                <div key={item.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{item.product.name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{item.warehouse.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold text-sm">{item.quantity} left</div>
                    <div className="text-white/30 text-xs">reorder at {item.reorderPoint}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
