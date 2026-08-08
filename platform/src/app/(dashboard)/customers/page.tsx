'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Users, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  loyaltyPts: number
  totalSpent: number
  orderCount: number
  tags: string[]
  createdAt: string
}

interface CustomerOrder {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [orderHistory, setOrderHistory] = useState<CustomerOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ take: '50' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/customers?${params}`)
      if (!res.ok) throw new Error('Failed to fetch customers')
      const data = await res.json()
      setCustomers(data.customers)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300)
    return () => clearTimeout(t)
  }, [fetchCustomers])

  async function openDetail(customer: Customer) {
    setSelected(customer)
    setDetailOpen(true)
    setOrdersLoading(true)
    setOrderHistory([])
    try {
      // Search by customer name as a proxy (real search by customerId isn't supported by the API)
      const res = await fetch(`/api/orders?search=${encodeURIComponent(customer.name)}&take=10`)
      if (res.ok) {
        const data = await res.json()
        setOrderHistory(data.orders ?? [])
      }
    } finally {
      setOrdersLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} customers</p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-5">
        <CardContent className="py-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Search by name, phone, or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            All Customers
            {!loading && <span className="text-white/30 font-normal ml-2">({customers.length})</span>}
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
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Loyalty Pts</TableHead>
              <TableHead>Since</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <Users size={36} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No customers found</p>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => openDetail(c)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-300 text-xs font-semibold flex-shrink-0">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{c.name}</div>
                        {c.email && <div className="text-white/40 text-xs">{c.email}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/60">{c.phone ?? '—'}</TableCell>
                  <TableCell className="text-white">{c.orderCount}</TableCell>
                  <TableCell>
                    <span className="text-white font-semibold">{formatCurrency(c.totalSpent)}</span>
                  </TableCell>
                  <TableCell className="text-white/60">{c.loyaltyPts} pts</TableCell>
                  <TableCell className="text-white/40 text-xs">{formatDate(c.createdAt)}</TableCell>
                  <TableCell>
                    <ChevronRight size={15} className="text-white/20" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Customer Detail Modal */}
      <Modal open={detailOpen} onOpenChange={setDetailOpen}>
        <ModalHeader
          title={selected?.name ?? 'Customer'}
          description={selected?.email ?? selected?.phone ?? ''}
          onClose={() => setDetailOpen(false)}
        />
        <ModalBody className="space-y-4">
          {selected && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-lg">{selected.orderCount}</div>
                  <div className="text-white/40 text-xs">Orders</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-lg">{formatCurrency(selected.totalSpent)}</div>
                  <div className="text-white/40 text-xs">Spent</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white font-bold text-lg">{selected.loyaltyPts}</div>
                  <div className="text-white/40 text-xs">Points</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-white/40 mb-2">Recent Orders</div>
                {ordersLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 bg-white/5 rounded animate-pulse" />
                    ))}
                  </div>
                ) : orderHistory.length === 0 ? (
                  <div className="text-white/30 text-sm text-center py-4">No orders yet</div>
                ) : (
                  <div className="space-y-1.5">
                    {orderHistory.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5 text-sm"
                      >
                        <div>
                          <div className="text-white font-mono text-xs">{order.orderNumber}</div>
                          <div className="text-white/40 text-xs">{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(order.total)}</div>
                          <div className="text-white/40 text-xs">{order.status.toLowerCase()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
