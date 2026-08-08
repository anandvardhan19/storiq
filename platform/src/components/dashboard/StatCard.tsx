import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  iconColor?: string
  iconBg?: string
}

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  iconColor = 'text-brand-400',
  iconBg = 'bg-brand-500/10',
}: StatCardProps) {
  return (
    <div className="bg-surface-900 border border-white/5 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              trend.positive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {trend.positive ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-white/40">{label}</div>
      {sub && <div className="text-xs text-white/25 mt-1">{sub}</div>}
    </div>
  )
}
