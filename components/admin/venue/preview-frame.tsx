import type { ReactNode } from 'react'
import { SuiteToggle } from '@/components/suite/suite-toggle'

export function PreviewFrame({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-[var(--dashboard-background)] p-4 text-[var(--dashboard-text)] md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">Venue suite</p>
          <h1 className="font-serif text-4xl">{title}</h1>
          {lede && <p className="mt-2 max-w-xl text-sm text-[var(--dashboard-text-muted)]">{lede}</p>}
        </div>
        <SuiteToggle />
      </div>
      {children}
    </div>
  )
}
