'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',  href: '/dashboard',   icon: LayoutDashboard },
  { label: 'Inventory',  href: '/inventory',   icon: Package },
  { label: 'Orders',     href: '/orders',      icon: ShoppingCart },
  { label: 'Customers',  href: '/customers',   icon: UserCircle },
  { label: 'Staff',      href: '/staff',       icon: Users },
  { label: 'Analytics',  href: '/analytics',   icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-60 flex-shrink-0 bg-surface-900 border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">
              {session?.user?.storeName ?? 'My Store'}
            </div>
            <div className="text-white/30 text-xs">Commerce OS</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                active
                  ? 'bg-brand-500/10 text-brand-300 font-medium'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              )}
            >
              <Icon size={17} className={active ? 'text-brand-400' : 'text-current'} />
              {label}
              {active && <ChevronRight size={13} className="ml-auto text-brand-400/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Settings + User */}
      <div className="border-t border-white/5 p-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-brand-500/10 text-brand-300 font-medium'
              : 'text-white/50 hover:text-white/90 hover:bg-white/5'
          )}
        >
          <Settings size={17} />
          Settings
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/90 hover:bg-white/5 transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>

        {/* User chip */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 text-xs font-semibold flex-shrink-0">
            {getInitials(session?.user?.name ?? 'U')}
          </div>
          <div className="min-w-0">
            <div className="text-white/80 text-xs font-medium truncate">{session?.user?.name}</div>
            <div className="text-white/30 text-xs truncate">{session?.user?.role?.toLowerCase()}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
