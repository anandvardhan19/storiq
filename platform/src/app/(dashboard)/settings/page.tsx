import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Settings } from 'lucide-react'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.storeId) return null

  const store = await db.store.findUnique({
    where: { id: session.user.storeId },
    include: { settings: true },
  })

  if (!store) return null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your store configuration</p>
      </div>

      <div className="space-y-4">
        {/* Store Details */}
        <div className="bg-surface-900 border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Store Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Store name', value: store.name, key: 'name' },
              { label: 'Store URL slug', value: store.slug, key: 'slug' },
              { label: 'Email', value: store.email ?? '', key: 'email' },
              { label: 'Phone', value: store.phone ?? '', key: 'phone' },
            ].map(({ label, value, key }) => (
              <div key={key}>
                <label className="block text-xs text-white/40 mb-1.5">{label}</label>
                <input
                  defaultValue={value}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div className="bg-surface-900 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Current Plan</h2>
              <p className="text-white/40 text-xs mt-1">You are on the {store.plan} plan</p>
            </div>
            <span className="bg-brand-500/10 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              {store.plan}
            </span>
          </div>
          {store.plan === 'FREE' && (
            <button className="mt-4 w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors">
              Upgrade to Pro — ₹999/mo
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-surface-900 border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Notifications</h2>
          {[
            { label: 'WhatsApp notifications', desc: 'Receive order alerts on WhatsApp', key: 'whatsapp', value: store.settings?.whatsappNotifications },
            { label: 'Email notifications', desc: 'Receive daily reports via email', key: 'email', value: store.settings?.emailNotifications },
          ].map(({ label, desc, key, value }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-none">
              <div>
                <div className="text-white text-sm">{label}</div>
                <div className="text-white/40 text-xs mt-0.5">{desc}</div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${value ? 'bg-brand-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-white m-1 transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>

        <button className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors">
          Save changes
        </button>
      </div>
    </div>
  )
}
