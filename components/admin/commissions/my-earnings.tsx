'use client'

import { useState, useTransition } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { PanelTabs } from '@/components/admin/panel-tabs'
import { Presence } from '@/components/motion/presence'
import { createEventCheckout, startPlannerKyc } from '@/lib/commissions/actions'
import type { PaymentKind } from '@/lib/commissions/calc'
import type { EarningsData } from '@/lib/commissions/types'
import { Figures, KycChip, Notice, PressButton, StateChip, money, pct, shortDate, triggerLabel } from './parts'

const TABS = ['events', 'payment_links', 'history'] as const
type Tab = (typeof TABS)[number]

export function MyEarnings({ data, demo = false }: { data: EarningsData; demo?: boolean }) {
  const { planner: me, settings } = data
  const cur = settings.currency
  const [tab, setTab] = useState<Tab>('events')
  const [flash, setFlash] = useState<string | null>(null)
  const [composer, setComposer] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const nextUp = data.events.filter((e) => e.state === 'pending').reduce((s, e) => s + Math.round((e.collectedCents * e.rateBps) / 10000), 0)

  const verify = () => {
    if (demo) { setFlash('Preview: opens Whop identity check'); return }
    start(async () => {
      const r = await startPlannerKyc()
      if (r.ok) window.location.assign(r.url)
      else setFlash(r.error)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {!data.whopConfigured && <Notice>Payments aren&apos;t switched on yet. Ask an admin to connect Whop.</Notice>}

      <section className="border border-[var(--dashboard-border)] bg-[var(--theme-dark)] p-5 text-white">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/60">Ready to pay out</p>
        <p className="mt-2 font-serif text-5xl leading-none tabular-nums text-[var(--theme-accent,#d4b26a)]">{money(me.earnedCents, cur)}</p>
        <p className="mt-3 text-sm text-white/70">
          You earn {pct(me.rateBps ?? settings.defaultRateBps)} {triggerLabel(me.earnTrigger ?? settings.earnTrigger).toLowerCase()}.
          {me.kycStatus === 'approved' ? ' Transfers land in your Whop balance.' : ' Verify your identity with Whop to get paid.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="[&>span]:border-white/30 [&>span]:text-white"><KycChip status={me.kycStatus} /></span>
          {me.kycStatus !== 'approved' && (
            <button type="button" onClick={verify} disabled={pending}
              className="inline-flex min-h-11 items-center bg-white px-4 text-sm font-medium text-[var(--theme-dark)] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-60">
              {me.kycStatus === 'pending' ? 'Continue verification' : 'Verify with Whop'}
            </button>
          )}
        </div>
      </section>

      <Figures items={[
        { label: 'Paid to date', value: money(me.paidCents, cur) },
        { label: 'On the way', value: money(nextUp, cur), note: 'Once events are paid in full' },
        { label: 'Held', value: money(me.heldCents, cur), note: me.heldCents ? 'A chargeback is open' : 'Nothing held' },
        { label: 'Events', value: String(data.events.length) },
      ]} />

      {me.owedBackCents > 0 && <Notice>{money(me.owedBackCents, cur)} was refunded after you were paid. It comes out of your next payout.</Notice>}

      <Presence show={!!flash} id={flash ?? ''}><p role="status" className="text-sm text-[var(--dashboard-text-muted)]">{flash}</p></Presence>

      <PanelTabs tabs={TABS} value={tab} onChange={setTab} label="My earnings" />

      {tab === 'events' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
          {data.events.map((e) => (
            <li key={e.leadId}>
              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.title}</p>
                  <p className="mt-0.5 text-xs tabular-nums text-[var(--dashboard-text-muted)]">{shortDate(e.eventDate)} · {money(e.collectedCents, cur)} collected · {pct(e.rateBps)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm tabular-nums">{money(e.commissionCents, cur)}</span>
                  <StateChip state={e.state} />
                </div>
              </div>
              <div className="px-4 pb-4">
                <button type="button" className="hub-chip" aria-expanded={composer === e.leadId} onClick={() => setComposer(composer === e.leadId ? null : e.leadId)}>
                  {composer === e.leadId ? 'Cancel' : 'Request a payment'}
                </button>
                <Presence show={composer === e.leadId} id={`c-${e.leadId}`}>
                  <Composer leadId={e.leadId} demo={demo} disabled={!data.whopConfigured} onDone={(m) => { setFlash(m); setComposer(null) }} />
                </Presence>
              </div>
            </li>
          ))}
          {data.events.length === 0 && <li className="p-6 text-sm text-[var(--dashboard-text-muted)]">No events assigned yet.</li>}
        </ul>
      )}

      {tab === 'payment_links' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
          {data.links.map((k) => <LinkRow key={k.id} k={k} cur={cur} />)}
          {data.links.length === 0 && <li className="p-6 text-sm text-[var(--dashboard-text-muted)]">No payment links yet.</li>}
        </ul>
      )}

      {tab === 'history' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
          {data.entries.map((x) => (
            <li key={x.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{x.eventTitle}</p>
                <p className="mt-0.5 text-xs text-[var(--dashboard-text-muted)]">{shortDate(x.createdAt)} · {x.reason}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`text-sm tabular-nums ${x.amountCents < 0 ? 'text-[var(--dashboard-accent-red)]' : ''}`}>{money(x.amountCents, cur)}</span>
                <StateChip state={x.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Composer({ leadId, demo, disabled, onDone }: { leadId: string; demo: boolean; disabled: boolean; onDone: (msg: string) => void }) {
  const [kind, setKind] = useState<PaymentKind>('deposit')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const submit = () => {
    if (demo) { onDone('Preview: a Whop checkout link would be created'); return }
    start(async () => {
      const r = await createEventCheckout({ leadId, kind, amount: Number(amount) })
      if (!r.ok) { setError(r.error); return }
      await navigator.clipboard?.writeText(r.url).catch(() => {})
      onDone('Checkout link created and copied')
    })
  }
  return (
    <div className="mt-3 grid gap-3 border border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Type
        <select className="plan-field" value={kind} onChange={(e) => setKind(e.target.value as PaymentKind)}>
          <option value="deposit">Deposit</option>
          <option value="installment">Installment</option>
          <option value="final">Final payment</option>
        </select>
      </label>
      <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Amount (USD)
        <input className="plan-field tabular-nums" inputMode="decimal" placeholder="2,500" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
      </label>
      <PressButton disabled={pending || disabled || !amount} onClick={submit}>Create link</PressButton>
      {Number(amount) > 2500 && <p className="text-xs text-[var(--dashboard-text-muted)] sm:col-span-3">Links over $2,500 need Whop&apos;s higher-limit approval on the account.</p>}
      {error && <p role="alert" className="text-xs text-[var(--dashboard-accent-red)] sm:col-span-3">{error}</p>}
    </div>
  )
}

function LinkRow({ k, cur }: { k: EarningsData['links'][number]; cur: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{k.eventTitle}</p>
        <p className="mt-0.5 text-xs capitalize text-[var(--dashboard-text-muted)]">{k.kind} · {shortDate(k.createdAt)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm tabular-nums">{money(k.amountCents, cur)}</span>
        {k.status === 'open' && k.purchaseUrl ? (
          <>
            <button type="button" aria-label="Copy link" className="hub-chip inline-flex w-11 items-center justify-center px-0"
              onClick={() => { navigator.clipboard?.writeText(k.purchaseUrl!); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            <a href={k.purchaseUrl} target="_blank" rel="noreferrer" aria-label="Open link" className="hub-chip inline-flex w-11 items-center justify-center px-0"><ExternalLink className="size-4" /></a>
          </>
        ) : <StateChip state={k.status === 'paid' ? 'paid' : 'reversed'} />}
      </div>
    </li>
  )
}
