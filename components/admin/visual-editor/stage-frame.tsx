'use client'

import { cn } from '@/lib/utils'
import type { PreviewDevice } from '@/lib/admin/visual-editor-config'
import { PREVIEW_WIDTHS } from '@/lib/admin/visual-editor-config'

type StageFrameProps = {
  children: React.ReactNode
  device: PreviewDevice
  className?: string
}

export function StageFrame({ children, device, className }: StageFrameProps) {
  const width = PREVIEW_WIDTHS[device]

  return (
    <div
      className={cn(
        'flex flex-1 items-start justify-center overflow-auto p-4 md:p-8',
        'bg-[var(--dashboard-background)]',
        className,
      )}
    >
      <div
        className="relative w-full transition-[max-width] duration-300 ease-out"
        style={{ maxWidth: width === '100%' ? '1440px' : width }}
      >
        {/* Proscenium top rail */}
        <div
          className="h-[var(--dashboard-rail)] rounded-t-[var(--dashboard-radius)] bg-[var(--dashboard-accent-gold)]"
          aria-hidden
        />

        <div
          className={cn(
            'relative overflow-hidden rounded-b-[var(--dashboard-radius)] border border-[var(--dashboard-border)]',
            'bg-white shadow-[var(--dashboard-shadow-lg)]',
            device !== 'desktop' && 'mx-auto',
          )}
        >
          {/* Subtle vignette on the stage surround */}
          <div
            className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.04)]"
            aria-hidden
          />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  )
}
