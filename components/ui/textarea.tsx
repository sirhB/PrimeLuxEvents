import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-[100px] w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all duration-200',
        'placeholder:text-gray-400 text-gray-900',
        'bg-gray-50/50 border-gray-200',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-white',
        'hover:border-gray-300 hover:bg-white',
        'disabled:cursor-not-allowed disabled:opacity-50 outline-none',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
