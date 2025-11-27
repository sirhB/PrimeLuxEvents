import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-all duration-200',
        'placeholder:text-muted-foreground text-foreground',
        'bg-white border-border',
        'focus:border-gold focus:ring-2 focus:ring-gold/20',
        'hover:border-gold/50',
        'disabled:cursor-not-allowed disabled:opacity-50 outline-none',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
