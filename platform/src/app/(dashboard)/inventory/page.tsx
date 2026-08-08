'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, AlertTriangle, Package, Plus, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { PageSpinner } from '@/components/ui/spinner'
import ProductForm, { type ProductFormProduct } from '@/components/inventory/ProductForm'
import { formatCurrency } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: string
  quantity: number
  reorderPoint: number
  lastRestockedAt: string | null
  product: { id: string; name: string; sku: string; sellingPrice: number }
  variant: { id: string; name: string; sku: string } | null
  warehouse: { id: string; name: string }
}

interface Product {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  sellingPrice: number
  costPrice: number
  taxRate: number
  unit: string
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  description: string | null
  mrp: number | null
  categoryId: string | null
  category: { id: string; name: string } | null
  inventory: { quantity: number }[]
}

type Tab = 'stock' | 'products'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <TableRow>
      {[...Array(cols)].map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-white/5 rounded animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>('stock')

  // ── Stock state ──────────────────────────────────────────────────────────────
  const [items, setItems] = useState<InventoryItem[]>([])
  const [stockLoading, setStockLoading] = useState(true)
  const [stockError, setStockError] = useState('')
  const [search, setSearch] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustType, setAdjustType] = useState('ADJUSTMENT')
  const [adjustNote, setAdjustNote] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState('')

  // ── Products state ───────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [productTotal, setProductTotal] = useState(0)
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<ProductFormProduct | null>(null)

  // ── Fetch inventory items ────────────────────────────────────────────────────
  const fetchStock = useCallback(async () => {
    setStockLoading(true)
    setStockError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (lowStockOnly) params.set('lowStock', 'true')
      const res = await fetch(`/api/inventory?${params}`)
      if (!res.ok) throw new Error('Failed to fetch inventory')
      const data = await res.json()
      setItems(data.items)
    } catch (e: any) {
      setStockError(e.message)
    } finally {
      setStockLoading(false)
    }
  }, [search, lowStockOnly])

  useEffect(() => {
    if (tab !== 'stock') return
    const t = setTimeout(fetchStock, 300)
    return () => clearTimeout(t)
  }, [fetchStock, tab])

  // ── Fetch products ───────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError('')
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (productSearch) params.set('search', productSearch)
      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products)
      setProductTotal(data.total)
    } catch (e: any) {
      setProductsError(e.message)
    } finally {
      setProductsLoading(false)
    }
  }, [productSearch])

  useEffect(() => {
    if (tab !== 'products') return
    const t = setTimeout(fetchProducts, 300)
    return () => clearTimeout(t)
  }, [fetchProducts, tab])

  // ── Stock adjustment ─────────────────────────────────────────────────────────
  function openAdjust(item: InventoryItem) {
    setSelectedItem(item)
    setAdjustQty('')
    setAdjustType('ADJUSTMENT')
    setAdjustNote('')
    setAdjustError('')
    setAdjustOpen(true)
  }

  async function handleAdjust() {
    if (!selectedItem) return
    setAdjusting(true)
    setAdjustError('')
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          type: adjustType,
          quantity: parseInt(adjustQty),
          note: adjustNote || undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to adjust stock')
      }
      setAdjustOpen(false)
      fetchStock()
    } catch (e: any) {
      setAdjustError(e.message)
    } finally {
      setAdjusting(false)
    }
  }

  // ── Product form handlers ────────────────────────────────────────────────────
  function openAddProduct() {
    setEditProduct(null)
    setFormOpen(true)
  }

  function openEditProduct(p: Product) {
    setEditProduct({
      id: p.id,
      name: p.name,
      description: p.description,
      sku: p.sku,
      barcode: p.barcode,
      categoryId: p.categoryId,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      mrp: p.mrp,
      taxRate: p.taxRate,
      unit: p.unit,
      tags: p.tags,
      isFeatured: p.isFeatured,
    })
    setFormOpen(true)
  }

  function handleProductSaved() {
    fetchProducts()
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage products and stock levels</p>
        </div>
        {tab === 'products' && (
          <Button onClick={openAddProduct}>
            <Plus size={15} />
            Add product
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-900 border border-white/5 rounded-lg p-1 mb-5 w-fit">
        {(['stock', 'products'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'stock' ? 'Stock levels' : 'Product catalog'}
          </button>
        ))}
      </div>

      {/* ── STOCK LEVELS TAB ────────────────────────────────────────────────── */}
      {tab === 'stock' && (
        <>
          <Card className="mb-5">
            <CardContent className="py-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <Input
                    placeholder="Search products..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 accent-brand-500"
                  />
                  <AlertTriangle size={14} className="text-amber-400" />
                  Low stock only
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {lowStockOnly ? 'Low Stock Items' : 'All Inventory'}
                {!stockLoading && <span className="text-white/30 font-normal ml-2">({items.length})</span>}
              </CardTitle>
            </CardHeader>
            {stockError && (
              <div className="mx-5 my-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {stockError}
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reorder At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockLoading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} cols={7} />)
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <Package size={36} className="text-white/10 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">No inventory items found</p>
                      <p className="text-white/20 text-xs mt-1">Add products first from the Product catalog tab</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const isLow = item.quantity <= item.reorderPoint
                    const sku = item.variant?.sku ?? item.product.sku
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-white">{item.product.name}</div>
                          {item.variant && <div className="text-white/40 text-xs mt-0.5">{item.variant.name}</div>}
                        </TableCell>
                        <TableCell className="text-white/50 font-mono text-xs">{sku ?? '—'}</TableCell>
                        <TableCell className="text-white/60">{item.warehouse.name}</TableCell>
                        <TableCell>
                          <span className={isLow ? 'text-amber-400 font-semibold' : 'text-white'}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/50">{item.reorderPoint}</TableCell>
                        <TableCell>
                          {isLow ? <Badge variant="warning">Low Stock</Badge> : <Badge variant="success">In Stock</Badge>}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => openAdjust(item)}>Adjust</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* ── PRODUCT CATALOG TAB ─────────────────────────────────────────────── */}
      {tab === 'products' && (
        <>
          <Card className="mb-5">
            <CardContent className="py-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  placeholder="Search by name or SKU..."
                  className="pl-9"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Products
                {!productsLoading && (
                  <span className="text-white/30 font-normal ml-2">({productTotal})</span>
                )}
              </CardTitle>
            </CardHeader>
            {productsError && (
              <div className="mx-5 my-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {productsError}
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} cols={7} />)
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <Package size={36} className="text-white/10 mx-auto mb-3" />
                      <p className="text-white/30 text-sm">No products yet</p>
                      <button
                        onClick={openAddProduct}
                        className="mt-3 text-brand-400 hover:text-brand-300 text-sm transition-colors"
                      >
                        + Add your first product
                      </button>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => {
                    const totalQty = p.inventory.reduce((s, i) => s + i.quantity, 0)
                    const margin = p.costPrice > 0
                      ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(0)
                      : null
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium text-white">{p.name}</div>
                          {p.sku && <div className="text-white/35 text-xs font-mono mt-0.5">{p.sku}</div>}
                        </TableCell>
                        <TableCell className="text-white/50 text-sm">
                          {p.category?.name ?? '—'}
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-semibold">{formatCurrency(p.sellingPrice)}</div>
                          {margin && (
                            <div className={`text-xs mt-0.5 ${Number(margin) >= 30 ? 'text-emerald-400' : Number(margin) >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                              {margin}% margin
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-white/50">
                          {p.costPrice > 0 ? formatCurrency(p.costPrice) : '—'}
                        </TableCell>
                        <TableCell>
                          <span className={totalQty === 0 ? 'text-red-400' : totalQty <= 10 ? 'text-amber-400' : 'text-white'}>
                            {totalQty}
                          </span>
                        </TableCell>
                        <TableCell>
                          {p.isActive
                            ? <Badge variant="success">Active</Badge>
                            : <Badge variant="secondary">Inactive</Badge>}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditProduct(p)}
                            title="Edit product"
                          >
                            <Pencil size={13} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* ── STOCK ADJUSTMENT MODAL ───────────────────────────────────────────── */}
      <Modal open={adjustOpen} onOpenChange={setAdjustOpen}>
        <ModalHeader
          title="Adjust Stock"
          description={
            selectedItem
              ? `${selectedItem.product.name}${selectedItem.variant ? ' — ' + selectedItem.variant.name : ''} · ${selectedItem.quantity} units`
              : ''
          }
          onClose={() => setAdjustOpen(false)}
        />
        <ModalBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Adjustment type</label>
            <Select value={adjustType} onChange={(e) => setAdjustType(e.target.value)} className="w-full">
              <option value="ADJUSTMENT">Manual adjustment</option>
              <option value="PURCHASE">Purchase / Restock</option>
              <option value="DAMAGE">Damage / Loss</option>
              <option value="RETURN">Customer return</option>
              <option value="TRANSFER">Warehouse transfer</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Quantity (negative to deduct)</label>
            <Input
              type="number"
              placeholder="e.g. 50 or -10"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Note (optional)</label>
            <Input
              placeholder="Reason for adjustment..."
              value={adjustNote}
              onChange={(e) => setAdjustNote(e.target.value)}
            />
          </div>
          {adjustError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {adjustError}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setAdjustOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdjust}
            disabled={!adjustQty || isNaN(parseInt(adjustQty)) || adjusting}
          >
            {adjusting ? 'Saving…' : 'Save adjustment'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── PRODUCT FORM SLIDE-OVER ──────────────────────────────────────────── */}
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        onSuccess={handleProductSaved}
      />
    </div>
  )
}
