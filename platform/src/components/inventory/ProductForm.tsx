'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Package, IndianRupee, Tag, Barcode, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFormData {
  name: string
  description: string
  sku: string
  barcode: string
  categoryId: string
  costPrice: string
  sellingPrice: string
  mrp: string
  taxRate: string
  unit: string
  tags: string
  isFeatured: boolean
}

export interface ProductFormProduct {
  id: string
  name: string
  description?: string | null
  sku?: string | null
  barcode?: string | null
  categoryId?: string | null
  costPrice: number
  sellingPrice: number
  mrp?: number | null
  taxRate: number
  unit: string
  tags: string[]
  isFeatured: boolean
}

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass a product to enter edit mode; omit for create mode. */
  product?: ProductFormProduct | null
  onSuccess: (product: ProductFormProduct) => void
}

// ─── Field helpers ─────────────────────────────────────────────────────────────

const UNITS = ['piece', 'kg', 'gram', 'litre', 'ml', 'metre', 'box', 'pack', 'pair', 'set']
const TAX_RATES = ['0', '5', '12', '18', '28']

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-white/50 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-3">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductForm({ open, onOpenChange, product, onSuccess }: ProductFormProps) {
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const emptyForm: ProductFormData = {
    name: '',
    description: '',
    sku: '',
    barcode: '',
    categoryId: '',
    costPrice: '',
    sellingPrice: '',
    mrp: '',
    taxRate: '18',
    unit: 'piece',
    tags: '',
    isFeatured: false,
  }

  const [form, setForm] = useState<ProductFormData>(emptyForm)

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? '',
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        categoryId: product.categoryId ?? '',
        costPrice: product.costPrice > 0 ? String(product.costPrice) : '',
        sellingPrice: String(product.sellingPrice),
        mrp: product.mrp ? String(product.mrp) : '',
        taxRate: String(product.taxRate),
        unit: product.unit,
        tags: product.tags.join(', '),
        isFeatured: product.isFeatured,
      })
    } else {
      setForm(emptyForm)
    }
    setError('')
  }, [product, open])

  // Load categories
  useEffect(() => {
    if (!open) return
    fetch('/api/categories')
      .then((r) => r.ok ? r.json() : { categories: [] })
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {})
  }, [open])

  function set(key: keyof ProductFormData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Product name is required'); return }
    if (!form.sellingPrice || isNaN(Number(form.sellingPrice))) {
      setError('A valid selling price is required'); return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sku: form.sku.trim() || undefined,
      barcode: form.barcode.trim() || undefined,
      categoryId: form.categoryId || undefined,
      costPrice: form.costPrice ? Number(form.costPrice) : 0,
      sellingPrice: Number(form.sellingPrice),
      mrp: form.mrp ? Number(form.mrp) : undefined,
      taxRate: Number(form.taxRate),
      unit: form.unit,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isFeatured: form.isFeatured,
    }

    setLoading(true)
    try {
      const res = isEdit
        ? await fetch(`/api/products/${product!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(Array.isArray(d.error) ? d.error[0]?.message : d.error ?? 'Failed to save product')
      }

      const saved = await res.json()
      toast.success(isEdit ? 'Product updated' : 'Product created')
      onOpenChange(false)
      onSuccess(saved)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Profitability hint ────────────────────────────────────────────────────
  const cost = Number(form.costPrice) || 0
  const price = Number(form.sellingPrice) || 0
  const margin = cost > 0 && price > 0 ? (((price - cost) / price) * 100).toFixed(1) : null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

        {/* Slide-over panel */}
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 h-full z-50 flex flex-col',
            'w-full max-w-lg bg-surface-900 border-l border-white/10 shadow-2xl',
            'focus:outline-none',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right',
            'duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center">
                <Package size={14} className="text-brand-400" />
              </div>
              <div>
                <Dialog.Title className="text-white font-semibold text-sm">
                  {isEdit ? 'Edit product' : 'Add product'}
                </Dialog.Title>
                {isEdit && (
                  <Dialog.Description className="text-white/35 text-xs mt-0.5">
                    {product?.name}
                  </Dialog.Description>
                )}
              </div>
            </div>
            <Dialog.Close className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Scrollable body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* Basics */}
              <Section title="Details">
                <div>
                  <FieldLabel required>Product name</FieldLabel>
                  <Input
                    placeholder="e.g. Cotton Kurta — Blue"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    rows={2}
                    placeholder="Brief description (optional)"
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-500 transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>SKU</FieldLabel>
                    <div className="relative">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <Input
                        className="pl-8"
                        placeholder="AUTO-001"
                        value={form.sku}
                        onChange={(e) => set('sku', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Barcode</FieldLabel>
                    <div className="relative">
                      <Barcode size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <Input
                        className="pl-8"
                        placeholder="EAN / UPC"
                        value={form.barcode}
                        onChange={(e) => set('barcode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      value={form.categoryId}
                      onChange={(e) => set('categoryId', e.target.value)}
                      className="w-full"
                    >
                      <option value="">— None —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <FieldLabel>Unit</FieldLabel>
                    <Select
                      value={form.unit}
                      onChange={(e) => set('unit', e.target.value)}
                      className="w-full"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Section>

              {/* Pricing */}
              <Section title="Pricing">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Selling price (₹)</FieldLabel>
                    <div className="relative">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        value={form.sellingPrice}
                        onChange={(e) => set('sellingPrice', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Cost price (₹)</FieldLabel>
                    <div className="relative">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        value={form.costPrice}
                        onChange={(e) => set('costPrice', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>MRP (₹)</FieldLabel>
                    <div className="relative">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        value={form.mrp}
                        onChange={(e) => set('mrp', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>GST rate (%)</FieldLabel>
                    <Select
                      value={form.taxRate}
                      onChange={(e) => set('taxRate', e.target.value)}
                      className="w-full"
                    >
                      {TAX_RATES.map((r) => (
                        <option key={r} value={r}>{r}%</option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Live margin hint */}
                {margin !== null && (
                  <div className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm',
                    Number(margin) >= 30 ? 'bg-emerald-500/8 text-emerald-400' :
                    Number(margin) >= 10 ? 'bg-amber-500/8 text-amber-400' :
                    'bg-red-500/8 text-red-400'
                  )}>
                    <span className="font-semibold">{margin}% margin</span>
                    <span className="text-current/60 text-xs">
                      {Number(margin) >= 30 ? '· Healthy' : Number(margin) >= 10 ? '· Tight' : '· Low'}
                    </span>
                  </div>
                )}
              </Section>

              {/* Extras */}
              <Section title="Extra">
                <div>
                  <FieldLabel>Tags</FieldLabel>
                  <Input
                    placeholder="summer, cotton, kurta  (comma-separated)"
                    value={form.tags}
                    onChange={(e) => set('tags', e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => set('isFeatured', !form.isFeatured)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer',
                      form.isFeatured ? 'bg-brand-500' : 'bg-white/10'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-full bg-white m-1 transition-transform',
                      form.isFeatured ? 'translate-x-4' : 'translate-x-0'
                    )} />
                  </div>
                  <div>
                    <div className="text-white text-sm">Featured product</div>
                    <div className="text-white/35 text-xs">Highlight on your storefront</div>
                  </div>
                </label>
              </Section>

            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/5 flex-shrink-0">
              {error && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Dialog.Close asChild>
                  <Button variant="outline" className="flex-1" type="button">Cancel</Button>
                </Dialog.Close>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create product')}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
