'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    phone: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 503) {
          toast.error('⚠️ No database connected yet. Set DATABASE_URL in .env to register.', { duration: 6000 })
        } else {
          toast.error(data.error || 'Registration failed')
        }
        return
      }
      // Auto sign in after registration
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm text-surface-200/70 mb-1.5">{label}</label>
      <input
        type={type}
        required={key !== 'phone'}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-500 transition-colors"
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-white mb-1">Create your store</div>
          <div className="text-surface-200/50 text-sm">Free forever — no card needed</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('storeName', 'Store name', 'text', 'My Awesome Store')}
          {field('name', 'Your name', 'text', 'Anand Vardhan')}
          {field('email', 'Email', 'email', 'you@example.com')}
          {field('phone', 'Phone (optional)', 'tel', '+91 98765 43210')}
          {field('password', 'Password', 'password', '8+ characters')}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg py-2.5 font-semibold transition-colors mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-surface-200/40 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-400 hover:text-brand-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
