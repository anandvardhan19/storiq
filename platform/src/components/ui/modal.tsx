'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Modal({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-full max-w-md bg-surface-900 border border-white/10 rounded-xl shadow-2xl',
            'animate-in fade-in-0 zoom-in-95'
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function ModalHeader({
  title,
  description,
  onClose,
}: {
  title: string
  description?: string
  onClose?: () => void
}) {
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b border-white/5">
      <div>
        <Dialog.Title className="text-white font-semibold text-base">{title}</Dialog.Title>
        {description && (
          <Dialog.Description className="text-white/40 text-xs mt-0.5">{description}</Dialog.Description>
        )}
      </div>
      <Dialog.Close asChild>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
        >
          <X size={16} />
        </button>
      </Dialog.Close>
    </div>
  )
}

export function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-5 py-4 border-t border-white/5 flex items-center justify-end gap-3', className)}
      {...props}
    />
  )
}
