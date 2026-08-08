import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-9 rounded-lg border border-white/10 bg-surface-900 px-3 py-1 text-sm text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer',
        className
      )}
      {...props}
    />
  )
})
Select.displayName = 'Select'

export { Select }
