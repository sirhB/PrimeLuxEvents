import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[120px] w-full rounded-[var(--radius)] border px-4 py-3 text-sm shadow-sm transition-all duration-300',
        'placeholder:text-muted-foreground text-foreground',
        'bg-muted/30 border-border',
        'focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-background',
        'hover:border-border/80 hover:bg-muted/50',
        'disabled:cursor-not-allowed disabled:opacity-50 outline-none',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
