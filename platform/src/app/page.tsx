import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  Package, ShoppingCart, Users, BarChart3, Shield, Zap,
  CheckCircle, ArrowRight, Star, Smartphone, Globe, Truck,
  Store, TrendingUp, Bell, FileText
} from 'lucide-react'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Storiq</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/demo" className="text-sm bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 rounded-lg transition-colors">
              Try Demo
            </Link>
            <Link href="/signup" className="text-sm bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-lg font-medium transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-brand-300 text-sm font-medium">Phase 1 MVP — Built for Indian SMBs</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Run your store smarter<br />
            <span className="text-brand-400">with AI at your side</span>
          </h1>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Inventory, sales, staff, and analytics — all in one place.
            Built for kirana stores, boutiques, and SMBs across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors"
            >
              Get started free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors"
            >
              Try live demo →
            </Link>
          </div>

          <p className="text-gray-600 text-sm">Free forever on the starter plan · No credit card required</p>

          {/* Dashboard preview card */}
          <div className="mt-16 relative mx-auto max-w-3xl">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Revenue', value: '₹2,84,500', up: '+12%', color: 'text-green-400' },
                    { label: 'Orders', value: '847', up: '+8%', color: 'text-blue-400' },
                    { label: 'Customers', value: '234', up: '+15%', color: 'text-purple-400' },
                    { label: 'Products', value: '156', up: 'Active', color: 'text-amber-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-900 rounded-lg p-3">
                      <div className="text-gray-500 text-xs mb-1">{s.label}</div>
                      <div className="text-white font-bold text-sm">{s.value}</div>
                      <div className={`text-xs ${s.color}`}>{s.up}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-900 rounded-lg p-3 flex gap-2">
                  {[40, 65, 45, 70, 55, 80, 60, 90, 75, 85, 65, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex items-end" style={{ height: 40 }}>
                      <div className="w-full bg-brand-500/40 rounded-sm" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-gray-600 text-sm mb-8">Trusted by store owners across India</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Products managed' },
              { value: '₹50L+', label: 'Sales tracked' },
              { value: '500+', label: 'Store owners' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything your store needs</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">One platform replaces your Excel sheets, WhatsApp notes, and separate billing software.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Package, color: 'bg-blue-500/10 text-blue-400',
                title: 'Smart Inventory',
                desc: 'Track stock across warehouses, get low-stock alerts before you run out, and manage variants (size, colour) with ease.'
              },
              {
                icon: ShoppingCart, color: 'bg-green-500/10 text-green-400',
                title: 'Orders & Sales',
                desc: 'POS for in-store sales, online orders, WhatsApp orders — all in one place. Auto-generate invoices and track payments.'
              },
              {
                icon: Users, color: 'bg-purple-500/10 text-purple-400',
                title: 'Customer CRM',
                desc: 'Build customer profiles with full order history, loyalty points, and WhatsApp/SMS campaigns to bring them back.'
              },
              {
                icon: BarChart3, color: 'bg-amber-500/10 text-amber-400',
                title: 'Analytics & Reports',
                desc: 'Daily revenue, top products, staff performance, and AI-powered demand forecasting — all in plain Hindi/English.'
              },
              {
                icon: Users, color: 'bg-rose-500/10 text-rose-400',
                title: 'Staff Management',
                desc: 'Manage shifts, track attendance, and see per-staff sales performance. Role-based access so your team sees only what they need.'
              },
              {
                icon: Zap, color: 'bg-cyan-500/10 text-cyan-400',
                title: 'AI Assistant',
                desc: 'Ask "What sold best this week?" or "Which products are about to go out of stock?" — get answers instantly in plain language.'
              },
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-4 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Up and running in 5 minutes</h2>
            <p className="text-gray-400 text-lg">No technical setup. No training needed.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Store, title: 'Create your store', desc: 'Sign up with your email or Google. Name your store and you\'re in.' },
              { step: '02', icon: Package, title: 'Add your products', desc: 'Add products with photos, prices, and stock levels. Import from Excel too.' },
              { step: '03', icon: TrendingUp, title: 'Start selling', desc: 'Use the POS for in-store sales. Share your store link for online orders.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center">
                    <s.icon className="w-8 h-8 text-brand-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{s.step.slice(1)}</div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Store owners love it</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Priya Sharma', store: 'Priya Boutique, Jaipur', stars: 5,
                quote: 'I used to manage inventory in 3 notebooks. Now I just check my phone. Low-stock alerts alone saved me ₹40,000 last month.'
              },
              {
                name: 'Rajesh Gupta', store: 'Rajesh Electronics, Surat', stars: 5,
                quote: 'My cashiers use the POS and I get live sales reports on WhatsApp. I can run my shop from home now.'
              },
              {
                name: 'Meena Agarwal', store: 'Meena Sarees, Varanasi', stars: 5,
                quote: 'The customer loyalty system brought back 40% of my old customers. The WhatsApp reminders work like magic.'
              },
            ].map((t) => (
              <div key={t.name} className="bg-gray-900 border border-white/5 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.store}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-4 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, honest pricing</h2>
            <p className="text-gray-400 text-lg">Start free. Pay only when you grow.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Free', price: '₹0', period: 'forever',
                desc: 'For new stores getting started',
                features: ['1 store', '50 products', 'Basic inventory', 'POS billing', 'Email support'],
                cta: 'Get started free', href: '/signup', highlighted: false,
              },
              {
                name: 'Pro', price: '₹999', period: '/month',
                desc: 'For growing stores',
                features: ['Unlimited products', 'AI assistant', 'Staff management', 'Customer CRM', 'WhatsApp alerts', 'Analytics & reports', 'Priority support'],
                cta: 'Start free trial', href: '/signup', highlighted: true,
              },
              {
                name: 'Business', price: '₹2,999', period: '/month',
                desc: 'For multi-location businesses',
                features: ['Everything in Pro', 'Multiple stores', 'Marketplace sync', 'Custom integrations', 'Dedicated support', 'API access', 'Team training'],
                cta: 'Contact us', href: '/signup', highlighted: false,
              },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl p-6 border ${p.highlighted ? 'bg-brand-500/10 border-brand-500/40 relative' : 'bg-gray-900 border-white/5'}`}>
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</div>
                )}
                <div className="text-gray-400 text-sm mb-1">{p.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{p.price}</span>
                  <span className="text-gray-500 text-sm">{p.period}</span>
                </div>
                <p className="text-gray-500 text-xs mb-6">{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`block text-center py-2.5 rounded-xl font-medium text-sm transition-colors ${p.highlighted ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Connects with tools you already use</h2>
          <p className="text-gray-400 mb-10">Razorpay · Shiprocket · WhatsApp · Tally · Amazon · Flipkart · Meesho · UPI</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Razorpay', 'WhatsApp Business', 'Shiprocket', 'Tally', 'Amazon', 'Flipkart', 'Meesho', 'UPI QR'].map((i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-lg px-4 py-2 text-gray-400 text-sm">{i}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-brand-900/40 to-purple-900/20 border border-brand-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to run a smarter store?</h2>
            <p className="text-gray-400 mb-8">Join hundreds of store owners who replaced Excel with Storiq.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors">
                Get started free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo" className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors">
                Try demo first
              </Link>
            </div>
            <p className="text-gray-600 text-xs mt-6">Free forever · No credit card · Setup in 5 minutes</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Storiq</span>
          </div>
          <p className="text-gray-600 text-xs">© 2026 Storiq. Built for Indian SMBs.</p>
          <div className="flex gap-6 text-xs text-gray-600">
            <a href="#" className="hover:text-gray-400">Privacy</a>
            <a href="#" className="hover:text-gray-400">Terms</a>
            <a href="#" className="hover:text-gray-400">Contact</a>
          </div>
        </div>
      </footer>

    </main>
  )
}
