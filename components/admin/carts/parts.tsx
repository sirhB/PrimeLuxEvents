'use client'

import { cn } from '@/lib/utils'

export const money = (c: number, cur = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: cur.toUpperCase() }).format(c / 100)
export const pct = (bps: number) => `${(bps / 100).toFixed(bps % 100 ? 1 : 0)}%`
export const shortDate = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

const STATE_TONE: Record<string, string> = {
  pending: 'text-[var(--dashboard-text-muted)] border-[var(--dashboard-border)]',
  earned: 'text-[var(--dashboard-accent-gold)] border-[color-mix(in_srgb,var(--dashboard-accent-gold)_40%,transparent)]',
  transferring: 'text-[var(--dashboard-accent-blue)] border-[color-mix(in_srgb,var(--dashboard-accent-blue)_35%,transparent)]',
  paid: 'text-[var(--dashboard-accent-green)] border-[color-mix(in_srgb,var(--dashboard-accent-green)_35%,transparent)]',
  held: 'text-[var(--dashboard-accent-orange)] border-[color-mix(in_srgb,var(--dashboard-accent-orange)_40%,transparent)]',
  failed: 'text-[var(--dashboard-accent-red)] border-[color-mix(in_srgb,var(--dashboard-accent-red)_35%,transparent)]',
  terminated: 'text-[var(--dashboard-accent-red)] border-[color-mix(in_srgb,var(--dashboard-accent-red)_35%,transparent)]',
  active: 'text-[var(--dashboard-accent-green)] border-[color-mix(in_srgb,var(--dashboard-accent-green)_35%,transparent)]',
  past_due: 'text-[var(--dashboard-accent-orange)] border-[color-mix(in_srgb,var(--dashboard-accent-orange)_40%,transparent)]',
  owed: 'text-[var(--dashboard-accent-gold)] border-[color-mix(in_srgb,var(--dashboard-accent-gold)_40%,transparent)]',
  approved: 'text-[var(--dashboard-accent-green)] border-[color-mix(in_srgb,var(--dashboard-accent-green)_35%,transparent)]',
  ordered: 'text-[var(--dashboard-accent-green)] border-[color-mix(in_srgb,var(--dashboard-accent-green)_35%,transparent)]',
  shared: 'text-[var(--dashboard-accent-blue)] border-[color-mix(in_srgb,var(--dashboard-accent-blue)_35%,transparent)]',
  overdue: 'text-[var(--dashboard-accent-red)] border-[color-mix(in_srgb,var(--dashboard-accent-red)_35%,transparent)]',
  open: 'text-[var(--dashboard-accent-blue)] border-[color-mix(in_srgb,var(--dashboard-accent-blue)_35%,transparent)]',
  reversed: 'text-[var(--dashboard-accent-red)] border-[color-mix(in_srgb,var(--dashboard-accent-red)_35%,transparent)]',
}

export function StateChip({ state }: { state: string }) {
  return (
    <span className={cn('inline-flex h-6 shrink-0 items-center border px-2 text-[11px] font-medium uppercase tracking-[0.08em]', STATE_TONE[state] ?? STATE_TONE.pending)}>
      {state.replace('_', ' ')}
    </span>
  )
}

/** Figure tiles. Numbers are the content, so they get the serif and tabular figures. */
export function Figures({ items }: { items: { label: string; value: string; note?: string; accent?: boolean }[] }) {
  return (
    <dl className="grid grid-cols-2 border-l border-t border-[var(--dashboard-border)] md:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="border-b border-r border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
          <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--dashboard-text-muted)]">{it.label}</dt>
          <dd className={cn('mt-2 font-serif text-2xl leading-none tabular-nums md:text-3xl', it.accent && 'text-[var(--dashboard-accent-gold)]')}>{it.value}</dd>
          {it.note && <p className="mt-1.5 text-xs text-[var(--dashboard-text-muted)]">{it.note}</p>}
        </div>
      ))}
    </dl>
  )
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-[var(--dashboard-accent-orange)] bg-[var(--dashboard-card)] px-4 py-3 text-sm text-[var(--dashboard-text-muted)]">
      {children}
    </p>
  )
}

export function PressButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 bg-[var(--theme-dark)] px-4 text-sm font-medium text-white',
        'transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-50',
        className,
      )}
    />
  )
}
