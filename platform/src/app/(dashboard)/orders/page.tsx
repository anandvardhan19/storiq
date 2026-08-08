'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, ChevronRight, X } from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { formatCurrency, formatDateTime } from '@/lib/utils'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

const STATUS_VARIANT: Record<OrderStatus, BadgeProps['variant']> = {
  PENDING: 'warning',
  CONFIRMED: 'default',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'secondary',
}

const TABS = ['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  createdAt: string
  source: string
  customer: { id: string; name: string; phone: string | null } | null
  items: { id: string; productName: string; quantity: number; total: number }[]
  _count: { items: number }
}

interface OrderDetail extends Order {
  notes: string | null
  paymentMethod: string | null
  payments: any[]
}

function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(6)].map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-white/5 rounded animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('ALL')
  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ take: '50' })
      if (activeTab !== 'ALL') params.set('status', activeTab)
      const res = await fetch(`/api/orders?${params}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data.orders)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  async function openDetail(order: Order) {
    setModalOpen(true)
    setDetailLoading(true)
    setDetailOrder(null)
    try {
      const res = await fetch(`/api/orders/${order.id}`)
      if (!res.ok) throw new Error('Failed to fetch order detail')
      setDetailOrder(await res.json())
    } catch {
      setDetailOrder(null)
    } finally {
      setDetailLoading(false)
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingStatus(orderId)
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchOrders()
      if (detailOrder?.id === orderId) {
        setDetailOrder((prev) => prev ? { ...prev, status } : null)
      }
    } finally {
      setUpdatingStatus(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} total orders</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-surface-900 border border-white/5 rounded-lg p-1 mb-5 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-brand-500 text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Orders
            {!loading && <span className="text-white/30 font-normal ml-2">({orders.length})</span>}
          </CardTitle>
        </CardHeader>
        {error && (
          <div className="mx-5 my-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <ShoppingCart size={36} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No orders found</p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => openDetail(order)}
                >
                  <TableCell>
                    <span className="font-mono text-white text-xs font-medium">
                      {order.orderNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-white">{order.customer?.name ?? 'Walk-in'}</div>
                    {order.customer?.phone && (
                      <div className="text-white/40 text-xs">{order.customer.phone}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-white/60">
                    {order._count.items} item{order._count.items !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    <span className="text-white font-semibold">{formatCurrency(order.total)}</span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      disabled={updatingStatus === order.id}
                      className="text-xs h-7 py-0"
                    >
                      {(['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'] as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell className="text-white/50 text-xs">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight size={15} className="text-white/20" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Order Detail Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalHeader
          title={detailOrder ? `Order ${detailOrder.orderNumber}` : 'Order Details'}
          description={detailOrder ? formatDateTime(detailOrder.createdAt) : ''}
          onClose={() => setModalOpen(false)}
        />
        <ModalBody>
          {detailLoading ? (
            <div className="space-y-3 py-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : detailOrder ? (
            <div className="space-y-4">
              {/* Customer */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40 mb-1">Customer</div>
                  <div className="text-white font-medium">
                    {detailOrder.customer?.name ?? 'Walk-in customer'}
                  </div>
                  {detailOrder.customer?.phone && (
                    <div className="text-white/50 text-xs">{detailOrder.customer.phone}</div>
                  )}
                </div>
                <Badge variant={STATUS_VARIANT[detailOrder.status] ?? 'secondary'}>
                  {detailOrder.status.toLowerCase()}
                </Badge>
              </div>

              {/* Items */}
              <div>
                <div className="text-xs text-white/40 mb-2">Items</div>
                <div className="space-y-1.5">
                  {detailOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="text-white/80">
                        {item.productName}
                        <span className="text-white/40 ml-1.5">x{item.quantity}</span>
                      </div>
                      <div className="text-white font-medium">{formatCurrency(item.total)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                <div className="text-white/50 text-sm">Total</div>
                <div className="text-white font-bold text-lg">
                  {formatCurrency(detailOrder.total)}
                </div>
              </div>

              {detailOrder.notes && (
                <div className="bg-white/5 rounded-lg p-3 text-sm text-white/60">
                  {detailOrder.notes}
                </div>
              )}

              {/* Update status */}
              <div className="space-y-1.5">
                <label className="text-xs text-white/40">Update Status</label>
                <Select
                  value={detailOrder.status}
                  onChange={(e) => updateStatus(detailOrder.id, e.target.value as OrderStatus)}
                  disabled={updatingStatus === detailOrder.id}
                  className="w-full"
                >
                  {(['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'] as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </Select>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-white/30 text-sm">
              Could not load order details
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
