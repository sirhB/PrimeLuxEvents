'use client'

import { useState, useTransition } from 'react'
import { motion, MotionConfig } from 'framer-motion'
import { Check } from 'lucide-react'
import { approvePlannerCart } from '@/lib/carts/actions'
import type { QuoteView } from '@/lib/carts/types'
import { money, shortDate } from '@/components/admin/carts/parts'

/** Read-only quote for the client. The only action is Approve (and paying, once approved). */
export function ClientQuote({ cart, demo = false }: { cart: QuoteView; demo?: boolean }) {
  const [status, setStatus] = useState(cart.status)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  // Totals are the server snapshot; client prices only (no cost or margin ever reaches this view).
  const t = cart
  const lineNet = (l: QuoteView['lines'][number]) => {
    const gross = l.clientUnitCents * l.quantity
    return gross - Math.round((gross * l.discountBps) / 10000)
  }
  const openLinks = cart.payments.filter((l) => l.status === 'open' && l.url)
  const owed = Math.max(0, t.totalCents - cart.paidCents)

  const approve = () => {
    if (demo) { setStatus('approved'); return }
    start(async () => {
      const r = await approvePlannerCart(cart.id)
      if (r.ok) setStatus('approved'); else setError(r.error)
    })
  }

  return (
    <MotionConfig reducedMotion="user">
      <article className="mx-auto flex max-w-2xl flex-col gap-6 pb-32 md:pb-0">
        <header>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dashboard-text-muted)]">Quote from {cart.plannerName} · {shortDate(cart.eventDate)}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight">{cart.title}</h1>
          {cart.noteToClient && <p className="mt-3 border-l-2 border-[var(--dashboard-accent-gold)] pl-3 text-sm leading-relaxed text-[var(--dashboard-text-muted)]">{cart.noteToClient}</p>}
        </header>

        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
          {cart.lines.map((l) => (
            <li key={l.id} className="flex items-start justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <p className="font-medium leading-snug">{l.name}</p>
                <p className="mt-0.5 text-xs tabular-nums text-[var(--dashboard-text-muted)]">
                  {l.quantity} × {money(l.clientUnitCents)}{l.discountBps > 0 && ` · ${l.discountBps / 100}% off`}
                </p>
                {l.note && <p className="mt-1 text-xs italic text-[var(--dashboard-text-muted)]">{l.note}</p>}
              </div>
              <p className="shrink-0 tabular-nums">{money(lineNet(l))}</p>
            </li>
          ))}
        </ul>

        <dl className="border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 text-sm">
          {[
            ['Items', t.subtotalCents],
            ...(t.setupFeeCents ? [['Setup', t.setupFeeCents] as const] : []),
            ...(t.deliveryFeeCents ? [['Delivery', t.deliveryFeeCents] as const] : []),
            ['Tax', t.taxCents],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between py-1.5"><dt className="text-[var(--dashboard-text-muted)]">{k}</dt><dd className="tabular-nums">{money(v as number)}</dd></div>
          ))}
          <div className="mt-2 flex items-baseline justify-between border-t border-[var(--dashboard-border)] pt-3">
            <dt className="font-medium">Total</dt><dd className="font-serif text-3xl tabular-nums">{money(t.totalCents)}</dd>
          </div>
          {cart.paidCents > 0 && <div className="flex justify-between pt-2 text-[var(--dashboard-text-muted)]"><dt>Paid</dt><dd className="tabular-nums">{money(cart.paidCents)}</dd></div>}
        </dl>

        {status === 'ordered' || status === 'paid' ? (
          <p className="flex items-center gap-2 text-sm"><Check className="size-4 text-[var(--dashboard-accent-green)]" /> Paid in full. This is now your event order.</p>
        ) : status === 'approved' ? (
          <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}>
            <p className="flex items-center gap-2 text-sm"><Check className="size-4 text-[var(--dashboard-accent-green)]" /> Approved. {openLinks.length ? `${money(owed)} left to pay to Prime Lux Events.` : 'Payment links will appear here.'}</p>
            {openLinks.length > 0 && (
              <ul className="mt-3 grid gap-2">
                {openLinks.map((k) => (
                  <li key={k.id}>
                    <a href={k.url!} target="_blank" rel="noreferrer"
                      className="flex min-h-12 items-center justify-between bg-[var(--theme-dark)] px-4 text-sm text-white transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98]">
                      <span>{k.label}</span><span className="tabular-nums">Pay {money(k.amountCents)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        ) : (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
            {error && <p role="alert" className="mb-2 text-xs text-[var(--dashboard-accent-red)]">{error}</p>}
            <button type="button" onClick={approve} disabled={pending}
              className="flex min-h-12 w-full items-center justify-center bg-[var(--theme-dark)] text-sm font-medium text-white transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-60">
              Approve quote · {money(t.totalCents)}
            </button>
            <p className="mt-2 text-center text-[11px] text-[var(--dashboard-text-muted)]">Questions? Message your planner before approving. Approving locks these prices.</p>
          </div>
        )}
      </article>
    </MotionConfig>
  )
}

export function QuoteList({ quotes }: { quotes: { id: string; title: string; status: string; totalCents: number }[] }) {
  if (!quotes.length) return null
  return (
    <section aria-label="Quotes" className="mx-auto mb-8 max-w-[1400px]">
      <h2 className="text-[11px] uppercase tracking-[0.18em] text-[var(--dashboard-text-muted)]">Quotes from your planner</h2>
      <ul className="mt-2 divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
        {quotes.map((q) => (
          <li key={q.id}>
            <a href={`/account/event/quote/${q.id}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--dashboard-card-hover)]">
              <span className="min-w-0 truncate font-medium">{q.title}</span>
              <span className="flex shrink-0 items-center gap-3 text-sm tabular-nums">
                {money(q.totalCents)}
                <span className="text-[11px] uppercase tracking-[0.08em] text-[var(--dashboard-accent-gold)]">{q.status === 'shared' ? 'Review' : q.status === 'approved' ? 'Approved' : 'Paid'}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
