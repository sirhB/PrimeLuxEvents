'use client'

import { cn } from '@/lib/utils'

/** Underline tabs for panel screens. Instant switch (frequency gate: no motion). */
export function PanelTabs<T extends string>({ tabs, value, onChange, label }: { tabs: readonly T[]; value: T; onChange: (tab: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="-mx-4 flex overflow-x-auto border-b border-[var(--dashboard-border)] px-4 md:mx-0 md:px-0">
      {tabs.map((item) => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={value === item}
          onClick={() => onChange(item)}
          className={cn(
            'relative min-h-11 shrink-0 px-4 text-sm capitalize transition-colors',
            value === item
              ? 'font-medium text-[var(--dashboard-text)] after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-[var(--theme-dark)]'
              : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]',
          )}
        >
          {item.replace('_', ' ')}
        </button>
      ))}
    </div>
  )
}
