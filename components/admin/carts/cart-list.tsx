'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPlannerCart } from '@/lib/carts/actions'
import type { CartSummary } from '@/lib/carts/types'
import { PressButton, StateChip, money, shortDate } from './parts'

export function CartList({ carts, events, base = '/admin/carts', showPlanner = false }: {
  carts: CartSummary[]; events: { leadId: string; title: string; eventDate: string | null }[]; base?: string; showPlanner?: boolean
}) {
  const [lead, setLead] = useState(events[0]?.leadId ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const open = () => start(async () => {
    const r = await createPlannerCart(lead)
    if (r.ok) router.push(`${base}/${r.id}`); else setError(r.error)
  })
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">New cart for
          <select className="plan-field" value={lead} onChange={(e) => setLead(e.target.value)}>
            {events.map((e) => <option key={e.leadId} value={e.leadId}>{e.title}{e.eventDate ? ` · ${shortDate(e.eventDate)}` : ''}</option>)}
            {events.length === 0 && <option value="">No events assigned to you yet. Ask an admin.</option>}
          </select>
        </label>
        <PressButton disabled={!lead || pending} onClick={open}>Open cart</PressButton>
        {error && <p role="alert" className="text-xs text-[var(--dashboard-accent-red)] sm:col-span-2">{error}</p>}
      </div>
      <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
        {carts.map((c) => (
          <li key={c.id}>
            <Link href={`${base}/${c.id}`} className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-[var(--dashboard-card-hover)]">
              <span className="min-w-0">
                <span className="block truncate font-medium">{c.title}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--dashboard-text-muted)]">{c.eventTitle} · {shortDate(c.eventDate)}{showPlanner && ` · ${c.plannerName}`}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm tabular-nums">{money(c.totalCents)}</span>
                <span className="text-[11px] tabular-nums text-[var(--dashboard-accent-gold)]">margin {money(c.marginCents)}</span>
                <StateChip state={c.status} />
              </span>
            </Link>
          </li>
        ))}
        {carts.length === 0 && <li className="p-6 text-sm text-[var(--dashboard-text-muted)]">No carts yet.</li>}
      </ul>
    </div>
  )
}
