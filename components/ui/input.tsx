import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary/30 selection:text-foreground',
        'bg-muted/30 border-border text-foreground',
        'h-12 w-full min-w-0 rounded-[var(--radius)] border px-4 py-2 text-sm shadow-sm transition-all duration-300',
        'outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-background',
        'hover:border-border/80 hover:bg-muted/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
