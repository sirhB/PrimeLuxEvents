'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { Presence } from '@/components/motion/presence'
import { createCartPayments, refundCartPayment } from '@/lib/carts/actions'
import { paymentSplit } from '@/lib/carts/split'
import { planPayments, type PlanMode } from '@/lib/carts/pricing'
import type { CartLimits, CartPaymentView, ConnectView } from '@/lib/carts/types'
import { PressButton, StateChip, money } from './parts'

const MODES: { id: PlanMode; label: string; hint: string }[] = [
  { id: 'full', label: 'In full', hint: 'One payment' },
  { id: 'deposit', label: 'Deposit', hint: 'Deposit, then balance' },
  { id: 'installments', label: 'Installments', hint: 'Even payments' },
]

export function PaymentStep({ cartId, totalCents, paidCents, limits, links, enabled, connect, demo, onFlash }: {
  cartId: string; totalCents: number; paidCents: number; limits: CartLimits; links: CartPaymentView[]
  enabled: boolean; connect: ConnectView; demo: boolean; onFlash: (m: string) => void
}) {
  const [mode, setMode] = useState<PlanMode>('deposit')
  const [depositPct, setDepositPct] = useState(String(limits.defaultDepositBps / 100))
  const [count, setCount] = useState(3)
  const [pending, start] = useTransition()
  const plan = useMemo(() => planPayments({
    totalCents, paidCents, mode, depositBps: Math.round(Number(depositPct || 0) * 100), installments: count,
  }), [totalCents, paidCents, mode, depositPct, count])
  const open = links.filter((l) => l.status !== 'void')

  const create = () => {
    if (demo) { onFlash(`Preview: ${plan.payments.length} Stripe payment links would be created`); return }
    start(async () => {
      const r = await createCartPayments(cartId, { mode, depositPct: Number(depositPct), installments: count })
      onFlash(r.ok ? `${r.count} payment link${r.count === 1 ? '' : 's'} ready` : r.error)
    })
  }

  return (
    <section aria-labelledby="pay-h" className="flex flex-col gap-4 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="pay-h" className="font-serif text-2xl">Collect payment</h2>
        <p className="text-xs tabular-nums text-[var(--dashboard-text-muted)]">{money(Math.max(0, totalCents - paidCents))} owed</p>
      </div>

      <div role="radiogroup" aria-label="Payment plan" className="grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)}
            className={`plan-choice !p-3 text-left transition-[border-color,background-color] duration-150 ${mode === m.id ? '!border-[var(--theme-dark)] bg-[var(--dashboard-surface)]' : ''}`}>
            <span className="block text-sm">{m.label}</span>
            <span className="mt-0.5 block text-[11px] font-normal text-[var(--dashboard-text-muted)]">{m.hint}</span>
          </button>
        ))}
      </div>

      {mode === 'deposit' && (
        <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Deposit (%)
          <input className="plan-field tabular-nums" inputMode="decimal" value={depositPct} onChange={(e) => setDepositPct(e.target.value.replace(/[^0-9.]/g, ''))} />
        </label>
      )}
      {mode === 'installments' && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[var(--dashboard-text-muted)]">Number of payments</span>
          <div className="flex items-center border border-[var(--dashboard-border)]">
            <button type="button" aria-label="Fewer" className="size-11 text-lg active:scale-[0.97]" onClick={() => setCount(Math.max(2, count - 1))}>−</button>
            <span className="w-8 text-center tabular-nums">{count}</span>
            <button type="button" aria-label="More" className="size-11 text-lg active:scale-[0.97]" onClick={() => setCount(Math.min(12, count + 1))}>+</button>
          </div>
        </div>
      )}

      <ol className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)]">
        {plan.payments.map((l, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-3">
            <span className="min-w-0 text-sm">
              <span className="mr-2 tabular-nums text-[var(--dashboard-text-muted)]">{i + 1}</span>{l.label}
              {l.kind === 'final' && <span className="ml-2 text-[11px] uppercase tracking-[0.08em] text-[var(--dashboard-accent-gold)]">final</span>}
            </span>
            <span className="shrink-0 text-sm tabular-nums">{money(l.amountCents)}</span>
          </li>
        ))}
      </ol>
      <Presence show={plan.warnings.length > 0} id={plan.warnings.join()}>
        <p className="border-l-2 border-[var(--dashboard-accent-orange)] pl-3 text-xs text-[var(--dashboard-text-muted)]">{plan.warnings.join(' ')}</p>
      </Presence>

      {!connect.ready && (
        <div role="status" className="border-l-2 border-[var(--dashboard-accent-orange)] bg-[var(--dashboard-surface)] p-3">
          <p className="text-sm">Connect payouts to send payment links</p>
          <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">
            Clients pay you directly through Stripe; Prime Lux&apos;s share comes out automatically. {connect.started ? 'Stripe still needs a few details.' : 'Setup takes a few minutes.'}
          </p>
          <Link href="/planners/membership#payouts" className="mt-2 inline-flex min-h-11 items-center text-sm text-[var(--dashboard-accent-gold)] underline underline-offset-4">
            {connect.started ? 'Finish Connect payouts' : 'Connect payouts'}
          </Link>
        </div>
      )}
      <PressButton disabled={!enabled || !connect.ready || pending || plan.payments.length === 0} onClick={create}>
        {plan.payments.length > 1 ? `Create ${plan.payments.length} Stripe payment links` : 'Create Stripe payment link'}
      </PressButton>
      {!enabled && <p className="text-xs text-[var(--dashboard-text-muted)]">Links unlock once the client approves the quote.</p>}

      {open.length > 0 && (
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--dashboard-text-muted)]">Links sent</h3>
          <ul className="mt-2 divide-y divide-[var(--dashboard-border)]">
            {open.map((k) => <LinkItem key={k.id} k={k} demo={demo} onFlash={onFlash} />)}
          </ul>
        </div>
      )}
    </section>
  )
}

export function LinkItem({ k, demo = false, onFlash }: { k: CartPaymentView; demo?: boolean; onFlash?: (m: string) => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <li className="py-2">
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0 truncate text-sm">{k.label}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-sm tabular-nums">{money(k.amountCents)}</span>
        {k.status === 'open' && k.url ? (
          <>
            <button type="button" aria-label="Copy link" className="hub-chip inline-flex w-11 items-center justify-center px-0"
              onClick={() => { navigator.clipboard?.writeText(k.url!); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            <a href={k.url} target="_blank" rel="noreferrer" aria-label="Open link" className="hub-chip inline-flex w-11 items-center justify-center px-0"><ExternalLink className="size-4" /></a>
          </>
        ) : <StateChip state={k.status} />}
      </span>
    </div>
    {k.split && <SplitRows k={k} demo={demo} onFlash={onFlash} />}
    </li>
  )
}

/** Read-only Stripe Connect split for one payment. Stripe moves the money; nothing to settle by hand. */
function SplitRows({ k, demo, onFlash }: { k: CartPaymentView; demo: boolean; onFlash?: (m: string) => void }) {
  const [pending, start] = useTransition()
  const s = k.split!
  const v = paymentSplit({ amountCents: k.amountCents, applicationFeeCents: s.applicationFeeCents, platformFeeCents: s.platformFeeCents, stripeFeeCents: s.stripeFeeCents, refundedCents: s.refundedCents, feeRefundedCents: s.feeRefundedCents })
  const row = (label: string, val: string, strong = false) => (
    <div className="flex justify-between gap-3"><dt className="text-[var(--dashboard-text-muted)]">{label}</dt><dd className={`tabular-nums ${strong ? 'text-[var(--dashboard-text)]' : ''}`}>{val}</dd></div>
  )
  const refund = () => {
    const left = k.amountCents - s.refundedCents
    const input = window.prompt(`Refund how much? Up to ${money(left)}. Prime Lux's fee is refunded in proportion.`, (left / 100).toFixed(2))
    if (!input) return
    const cents = Math.round(Number(input.replace(/[^0-9.]/g, '')) * 100)
    if (demo) { onFlash?.(`Preview: would refund ${money(cents)}`); return }
    start(async () => { const r = await refundCartPayment(k.id, cents); onFlash?.(r.ok ? 'Refund sent. Totals update when Stripe confirms.' : r.error) })
  }
  return (
    <dl className="mt-2 grid gap-1 border-l border-[var(--dashboard-border)] pl-3 text-xs">
      {row(k.status === 'paid' ? 'Client paid' : 'Client pays', money(v.clientPaidCents))}
      {row('Prime Lux rental share', `−${money(v.rentalShareCents)}`)}
      {v.platformFeeCents > 0 && row('Prime Lux platform fee', `−${money(v.platformFeeCents)}`)}
      {row('Stripe fee', v.stripeFeeCents == null ? (k.status === 'paid' ? 'pending' : 'after payment') : `−${money(v.stripeFeeCents)}`)}
      {row('Your net', v.plannerNetCents == null ? `≈ ${money(v.clientPaidCents - v.primeLuxFeeCents)} before Stripe fee` : money(v.plannerNetCents), true)}
      {s.refundedCents > 0 && <p className="text-[var(--dashboard-text-muted)]">Refunded {money(s.refundedCents)} (Prime Lux fee back {money(s.feeRefundedCents)})</p>}
      {s.disputeStatus !== 'none' && <p className="text-[var(--dashboard-accent-orange)]">Dispute {s.disputeStatus}. Respond in your Stripe Express dashboard.</p>}
      {k.status === 'paid' && s.refundedCents < k.amountCents && (
        <button type="button" disabled={pending} onClick={refund} className="mt-1 min-h-11 justify-self-start text-xs text-[var(--dashboard-accent-gold)] underline underline-offset-4">Refund…</button>
      )}
    </dl>
  )
}
