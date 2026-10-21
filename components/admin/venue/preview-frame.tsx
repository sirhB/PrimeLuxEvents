import type { ReactNode } from 'react'
import { SuiteToggle } from '@/components/suite/suite-toggle'

export function PreviewFrame({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <div className="admin-theme min-h-screen bg-[var(--dashboard-background)] px-4 py-5 text-[var(--dashboard-text)] md:p-10">
      <div className="mx-auto mb-8 flex max-w-[1400px] flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl leading-none tracking-[-0.02em] md:text-5xl">{title}</h1>
          {lede && <p className="mt-2 max-w-xl text-sm text-[var(--dashboard-text-muted)]">{lede}</p>}
        </div>
        <SuiteToggle />
      </div>
      <div className="mx-auto max-w-[1400px]">{children}</div>
    </div>
  )
}
