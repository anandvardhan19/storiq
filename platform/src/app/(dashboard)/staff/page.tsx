'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus } from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { getInitials, formatDate } from '@/lib/utils'

type Role = 'MANAGER' | 'CASHIER' | 'WAREHOUSE_STAFF' | 'VIEWER'

const ROLE_VARIANT: Record<string, BadgeProps['variant']> = {
  OWNER: 'default',
  MANAGER: 'default',
  CASHIER: 'success',
  WAREHOUSE_STAFF: 'warning',
  VIEWER: 'secondary',
}

interface StaffMember {
  id: string
  userId: string
  designation: string | null
  department: string | null
  isActive: boolean
  joinedAt: string | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    role: string
    avatar: string | null
  }
}

function SkeletonCard() {
  return (
    <div className="bg-surface-900 border border-white/5 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded w-32" />
          <div className="h-3 bg-white/5 rounded w-48" />
        </div>
      </div>
    </div>
  )
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CASHIER' as Role,
    designation: '',
    department: '',
  })

  async function fetchStaff() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/staff')
      if (!res.ok) throw new Error('Failed to fetch staff')
      const data = await res.json()
      setStaff(data.staff)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStaff() }, [])

  async function handleAdd() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          role: form.role,
          designation: form.designation || undefined,
          department: form.department || undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to add staff')
      }
      setModalOpen(false)
      setForm({ name: '', email: '', password: '', phone: '', role: 'CASHIER', designation: '', department: '' })
      fetchStaff()
    } catch (e: any) {
      setSubmitError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff</h1>
          <p className="text-white/40 text-sm mt-0.5">{total} team members</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus size={16} />
          Add Member
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-surface-900 border border-white/5 rounded-xl px-5 py-16 text-center">
          <Users size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No staff members yet</p>
          <Button className="mt-4" onClick={() => setModalOpen(true)}>
            <UserPlus size={15} />
            Add first member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-surface-900 border border-white/5 rounded-xl p-5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 font-semibold text-lg flex-shrink-0">
                  {getInitials(member.user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="text-white font-medium truncate">{member.user.name}</div>
                    <Badge variant={ROLE_VARIANT[member.user.role] ?? 'secondary'}>
                      {member.user.role.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-white/40 text-xs truncate">{member.user.email}</div>
                  {member.designation && (
                    <div className="text-white/50 text-xs mt-1">{member.designation}</div>
                  )}
                  {member.department && (
                    <div className="text-white/30 text-xs">{member.department}</div>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={member.isActive ? 'success' : 'destructive'}>
                      {member.isActive ? 'active' : 'inactive'}
                    </Badge>
                    {member.joinedAt && (
                      <span className="text-white/30 text-xs">
                        Joined {formatDate(member.joinedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalHeader
          title="Add Staff Member"
          description="Create a new login for a team member"
          onClose={() => setModalOpen(false)}
        />
        <ModalBody className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Full Name *</label>
              <Input
                placeholder="Anita Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Phone</label>
              <Input
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Email *</label>
            <Input
              type="email"
              placeholder="anita@store.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Password * (min 8 chars)</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 font-medium">Role *</label>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full"
            >
              <option value="MANAGER">Manager</option>
              <option value="CASHIER">Cashier</option>
              <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
              <option value="VIEWER">Viewer</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Designation</label>
              <Input
                placeholder="Store Manager"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 font-medium">Department</label>
              <Input
                placeholder="Sales"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
          </div>
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {submitError}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!form.name || !form.email || !form.password || submitting}
          >
            {submitting ? 'Adding...' : 'Add Member'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
