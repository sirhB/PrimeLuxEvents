import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-all duration-200',
        'placeholder:text-muted-foreground',
        'bg-[var(--dashboard-card)] border-[var(--dashboard-border)]',
        'focus:border-[var(--dashboard-accent-gold)] focus:ring-2 focus:ring-[var(--dashboard-accent-gold)]/20',
        'hover:border-[var(--dashboard-accent-gold)]/50',
        'disabled:cursor-not-allowed disabled:opacity-50 outline-none',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
