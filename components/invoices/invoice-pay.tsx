'use client'

import { money, shortDate } from '@/components/admin/carts/parts'
import type { PublicInvoice } from '@/lib/invoices/types'

/** Public client pay view. Client-safe fields only. Payment happens on Stripe's hosted invoice page. */
export function InvoicePay({ inv }: { inv: PublicInvoice }) {
  const owed = Math.max(0, inv.totalCents - inv.paidCents)
  const next = inv.payments.find((p) => p.status === 'open' || p.status === 'uncollectible')
  return (
    <div className="admin-theme min-h-screen bg-[var(--dashboard-background)] text-[var(--dashboard-text)]">
      <header className="bg-[var(--theme-dark)] px-5 pb-8 pt-10 text-white">
        <div className="mx-auto max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Invoice from</p>
          <h1 className="mt-1 font-serif text-4xl leading-tight">{inv.businessName}</h1>
          <p className="mt-4 text-sm text-white/70">For {inv.clientName} · {inv.title}</p>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/60">{owed ? 'Amount due' : 'Paid in full'}</p>
              <p className="font-serif text-5xl tabular-nums text-[var(--theme-accent,#d4b26a)]">{money(owed || inv.totalCents)}</p>
            </div>
            {inv.dueDate && owed > 0 && <p className="pb-2 text-right text-xs text-white/70">Due<br /><span className="text-sm text-white">{shortDate(next?.dueDate ?? inv.dueDate)}</span></p>}
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-xl gap-6 px-5 py-8">
        {next?.url && (
          <a href={next.url} className="inline-flex min-h-14 items-center justify-center bg-[var(--theme-dark)] text-base font-medium text-white transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]">
            Pay {money(next.amountCents)} securely
          </a>
        )}
        {inv.payments.length > 0 && (
          <section aria-labelledby="sched">
            <h2 id="sched" className="text-[11px] uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">Payment schedule</h2>
            <ol className="mt-2 divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)]">
              {inv.payments.map((p, i) => (
                <li key={i} className="grid grid-cols-[1fr_auto] gap-x-3 py-3 text-sm">
                  <span>{p.label}</span><span className="tabular-nums">{money(p.amountCents)}</span>
                  <span className="text-xs text-[var(--dashboard-text-muted)]">{p.status === 'paid' ? 'Paid' : p.dueDate ? `Due ${shortDate(p.dueDate)}` : ''}{p.number ? ` · ${p.number}` : ''}</span>
                  <span className="text-right text-xs">{p.pdf && <a className="underline underline-offset-4" href={p.pdf}>PDF</a>}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
        <section aria-labelledby="items">
          <h2 id="items" className="text-[11px] uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">Details</h2>
          <ul className="mt-2 divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)]">
            {inv.lines.map((l, i) => (
              <li key={i} className="flex justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">{l.name}{l.quantity > 1 && <span className="text-[var(--dashboard-text-muted)]"> × {l.quantity}</span>}{l.description && <span className="block text-xs text-[var(--dashboard-text-muted)]">{l.description}</span>}</span>
                <span className="shrink-0 tabular-nums">{money(l.unitCents * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 grid gap-1 text-sm">
            {inv.setupFeeCents > 0 && <div className="flex justify-between"><dt className="text-[var(--dashboard-text-muted)]">Setup</dt><dd className="tabular-nums">{money(inv.setupFeeCents)}</dd></div>}
            {inv.deliveryFeeCents > 0 && <div className="flex justify-between"><dt className="text-[var(--dashboard-text-muted)]">Delivery</dt><dd className="tabular-nums">{money(inv.deliveryFeeCents)}</dd></div>}
            <div className="flex justify-between"><dt className="text-[var(--dashboard-text-muted)]">Tax</dt><dd className="tabular-nums">{money(inv.taxCents)}</dd></div>
            <div className="flex justify-between border-t border-[var(--dashboard-border)] pt-2"><dt>Total</dt><dd className="font-medium tabular-nums">{money(inv.totalCents)}</dd></div>
          </dl>
        </section>
        {inv.memo && <p className="whitespace-pre-line border-l-2 border-[var(--dashboard-accent-gold)] pl-3 text-sm text-[var(--dashboard-text-muted)]">{inv.memo}</p>}
        <p className="pt-4 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--dashboard-text-muted)]">Powered by Prime Lux Events</p>
      </main>
    </div>
  )
}
