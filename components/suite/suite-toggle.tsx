'use client'

import { cn } from '@/lib/utils'
import { SUITES, type SuiteId } from '@/lib/suite'
import { useSuite } from '@/components/suite/use-suite'

export function SuiteToggle({
  tone = 'light',
  className,
}: {
  tone?: 'light' | 'dark'
  className?: string
}) {
  const { suite, setSuite } = useSuite()

  return (
    <div
      role="group"
      aria-label="Choose a suite"
      className={cn(
        'inline-flex items-center rounded-sm border p-0.5',
        tone === 'dark' ? 'border-white/20 bg-black/20' : 'border-[var(--theme-dark)]/15 bg-white/70',
        className,
      )}
    >
      {SUITES.map((item) => {
        const active = suite === item.id
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => setSuite(item.id as SuiteId)}
            className={cn(
              'min-h-9 min-w-[4.75rem] px-3 text-[10px] font-medium uppercase tracking-[0.22em] transition-colors',
              active
                ? 'bg-[var(--suite-chip)] text-[var(--suite-chip-ink)]'
                : tone === 'dark'
                  ? 'text-white/70 hover:text-white'
                  : 'text-[var(--theme-muted)] hover:text-[var(--theme-dark)]',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
