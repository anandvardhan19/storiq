'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { TrendingUp, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PageSpinner } from '@/components/ui/spinner'
import StatCard from '@/components/dashboard/StatCard'
import { formatCurrency } from '@/lib/utils'

interface AnalyticsData {
  revenue: number
  orderCount: number
  newCustomers: number
  lowStockCount: number
  topProducts: { productId: string; productName: string; _sum: { total: number | null; quantity: number | null } }[]
  revenueByDay: { date: string; revenue: number; orders: number }[]
  ordersByStatus: { status: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#38bdf8',
  PROCESSING: '#6366f1',
  SHIPPED: '#a78bfa',
  DELIVERED: '#34d399',
  CANCELLED: '#f87171',
  REFUNDED: '#fb923c',
}

const CHART_COLORS = ['#6366f1', '#34d399', '#38bdf8', '#f59e0b', '#f87171']

const RANGES = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
  { label: 'Last year', value: '365' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="text-white/50 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/70">{p.name}:</span>
          <span className="text-white font-medium">
            {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('30')

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/analytics?range=${range}`)
        if (!res.ok) throw new Error('Failed to fetch analytics')
        setData(await res.json())
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [range])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-white/40 text-sm mt-0.5">Store performance overview</p>
        </div>
        <Select value={range} onChange={(e) => setRange(e.target.value)}>
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Revenue"
              value={formatCurrency(data.revenue)}
              icon={TrendingUp}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/10"
            />
            <StatCard
              label="Orders"
              value={data.orderCount.toString()}
              icon={ShoppingCart}
            />
            <StatCard
              label="New Customers"
              value={data.newCustomers.toString()}
              icon={Users}
              iconColor="text-sky-400"
              iconBg="bg-sky-500/10"
            />
            <StatCard
              label="Low Stock Items"
              value={data.lowStockCount.toString()}
              icon={AlertTriangle}
              iconColor="text-amber-400"
              iconBg="bg-amber-500/10"
            />
          </div>

          {/* Revenue chart */}
          <Card className="mb-5">
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {data.revenueByDay.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-white/30 text-sm">
                  No revenue data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={data.revenueByDay} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Top products bar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Products</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topProducts.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-white/30 text-sm">
                    No product sales data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={data.topProducts.map((p) => ({
                        name: p.productName.length > 16 ? p.productName.slice(0, 14) + '…' : p.productName,
                        revenue: p._sum.total ?? 0,
                        qty: p._sum.quantity ?? 0,
                      }))}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={90}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                        {data.topProducts.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Orders by status pie */}
            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {data.ordersByStatus.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-white/30 text-sm">
                    No order data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data.ordersByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                      >
                        {data.ordersByStatus.map((entry, index) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status] ?? CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, (name as string).toLowerCase()]}
                        contentStyle={{
                          background: 'rgba(15,15,20,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                        itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
                      />
                      <Legend
                        formatter={(value) => (
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                            {value.toLowerCase()}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
