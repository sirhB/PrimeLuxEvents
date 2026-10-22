import Link from 'next/link'
import type { CartSummary } from '@/lib/carts/types'
import { StateChip, money } from './parts'

/** Planner carts and resulting orders for one event (server component). */
export function EventCarts({ carts }: { carts: CartSummary[] }) {
  if (!carts.length) return null
  return (
    <section aria-labelledby="event-carts-h" className="mt-8">
      <h2 id="event-carts-h" className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">Planner carts &amp; orders</h2>
      <ul className="mt-2 divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
        {carts.map((c) => (
          <li key={c.id}>
            <Link href={c.orderId ? `/admin/orders/${c.orderId}` : `/admin/carts/${c.id}`} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--dashboard-card-hover)]">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{c.title}</span>
                <span className="block text-xs text-[var(--dashboard-text-muted)]">{c.plannerName}{c.orderId ? ' · event order' : ''}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-sm tabular-nums">{money(c.paidCents)} / {money(c.totalCents)}<StateChip state={c.status} /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
