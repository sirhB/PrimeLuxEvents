'use client'

import { useMemo, useState, useTransition } from 'react'
import { PanelTabs } from '@/components/admin/panel-tabs'
import { Presence } from '@/components/motion/presence'
import { payPlannerNow, updateCommissionSettings, updateEventTerms, updatePlannerTerms } from '@/lib/commissions/actions'
import type { EarnTrigger } from '@/lib/commissions/calc'
import type { EventLedgerRow, LedgerData, PlannerLedgerRow } from '@/lib/commissions/types'
import { Figures, KycChip, Notice, PressButton, StateChip, money, pct, shortDate, triggerLabel } from './parts'

const TABS = ['planners', 'events', 'entries', 'rules'] as const
type Tab = (typeof TABS)[number]

export function CommissionLedger({ data, demo = false }: { data: LedgerData; demo?: boolean }) {
  const [tab, setTab] = useState<Tab>('planners')
  const [open, setOpen] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const cur = data.settings.currency

  const totals = useMemo(() => data.planners.reduce(
    (t, p) => ({ earned: t.earned + p.earnedCents, held: t.held + p.heldCents, paid: t.paid + p.paidCents }),
    { earned: 0, held: 0, paid: 0 },
  ), [data.planners])
  const pendingEvents = data.events.filter((e) => e.state === 'pending')

  const run = (label: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    if (demo) { setFlash(`${label} (preview: nothing sent)`); return }
    start(async () => {
      const r = await fn()
      setFlash(r.ok ? label : r.error ?? 'Something went wrong')
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {!data.whopConfigured && <Notice>Whop isn&apos;t connected. Set WHOP_API_KEY, WHOP_COMPANY_ID, and WHOP_WEBHOOK_SECRET to create links and pay planners.</Notice>}

      <Figures items={[
        { label: 'Earned, unpaid', value: money(totals.earned, cur), note: 'Ready to transfer', accent: true },
        { label: 'Pending', value: String(pendingEvents.length), note: pendingEvents.length === 1 ? 'event waiting on payment' : 'events waiting on payment' },
        { label: 'Held', value: money(totals.held, cur), note: 'Chargebacks open' },
        { label: 'Paid out', value: money(totals.paid, cur), note: 'Sent to Whop balances' },
      ]} />

      <Presence show={!!flash} id={flash ?? ''}>
        <p role="status" className="text-sm text-[var(--dashboard-text-muted)]">{flash}</p>
      </Presence>

      <PanelTabs tabs={TABS} value={tab} onChange={(t) => { setTab(t); setOpen(null) }} label="Commission ledger" />

      {tab === 'planners' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
          {data.planners.map((p) => (
            <PlannerItem key={p.id} p={p} cur={cur} defaultBps={data.settings.defaultRateBps} defaultTrigger={data.settings.earnTrigger}
              open={open === p.id} onToggle={() => setOpen(open === p.id ? null : p.id)} busy={pending}
              onSave={(rate, trig) => run(`Saved ${p.name}`, () => updatePlannerTerms(p.id, rate, trig))}
              onPay={() => run(`Transfer started for ${p.name}`, () => payPlannerNow(p.id))} />
          ))}
          {data.planners.length === 0 && <li className="p-6 text-sm text-[var(--dashboard-text-muted)]">No planners yet. A planner appears here once they connect Whop or get an event.</li>}
        </ul>
      )}

      {tab === 'events' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
          {data.events.map((e) => (
            <EventItem key={e.leadId} e={e} cur={cur} planners={data.planners} open={open === e.leadId} busy={pending}
              onToggle={() => setOpen(open === e.leadId ? null : e.leadId)}
              onSave={(plannerId, rate, trig) => run(`Saved ${e.title}`, () => updateEventTerms({ leadId: e.leadId, plannerId, ratePct: rate, trigger: trig }))} />
          ))}
        </ul>
      )}

      {tab === 'entries' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
          {data.entries.map((x) => (
            <li key={x.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{x.eventTitle}</p>
                <p className="mt-0.5 text-xs text-[var(--dashboard-text-muted)]">{x.plannerName} · {shortDate(x.createdAt)} · {x.reason}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`text-sm tabular-nums ${x.amountCents < 0 ? 'text-[var(--dashboard-accent-red)]' : ''}`}>{money(x.amountCents, cur)}</span>
                <StateChip state={x.status} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'rules' && <Rules data={data} busy={pending} onSave={(r, t, a) => run('Rules saved', () => updateCommissionSettings({ ratePct: r, trigger: t, autoTransfer: a }))} />}
    </div>
  )
}

function PlannerItem({ p, cur, defaultBps, defaultTrigger, open, onToggle, onSave, onPay, busy }: {
  p: PlannerLedgerRow; cur: string; defaultBps: number; defaultTrigger: EarnTrigger; open: boolean; busy: boolean
  onToggle: () => void; onSave: (rate: number | null, trig: EarnTrigger | null) => void; onPay: () => void
}) {
  const [rate, setRate] = useState(p.rateBps == null ? '' : String(p.rateBps / 100))
  const [trig, setTrig] = useState<string>(p.earnTrigger ?? '')
  return (
    <li>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--dashboard-card-hover)]">
        <div className="min-w-0">
          <p className="truncate font-medium">{p.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--dashboard-text-muted)]">
            <KycChip status={p.kycStatus} />
            <span>{pct(p.rateBps ?? defaultBps)}{p.rateBps == null && ' default'} · {triggerLabel(p.earnTrigger ?? defaultTrigger)}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-serif text-xl tabular-nums text-[var(--dashboard-accent-gold)]">{money(p.earnedCents, cur)}</p>
          <p className="text-xs tabular-nums text-[var(--dashboard-text-muted)]">{money(p.paidCents, cur)} paid</p>
        </div>
      </button>
      <Presence show={open} id={`p-${p.id}`}>
        <div className="grid gap-4 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] px-4 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          {(p.heldCents > 0 || p.owedBackCents > 0) && (
            <p className="text-xs text-[var(--dashboard-accent-orange)] sm:col-span-3">
              {p.heldCents > 0 && `${money(p.heldCents, cur)} held for a chargeback. `}
              {p.owedBackCents > 0 && `${money(p.owedBackCents, cur)} reversed after payout; it comes out of the next transfer.`}
            </p>
          )}
          <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Rate (%)
            <input className="plan-field tabular-nums" inputMode="decimal" placeholder={`Default ${pct(defaultBps)}`} value={rate} onChange={(e) => setRate(e.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Earned
            <select className="plan-field" value={trig} onChange={(e) => setTrig(e.target.value)}>
              <option value="">Default ({triggerLabel(defaultTrigger).toLowerCase()})</option>
              <option value="deposit">On deposit</option>
              <option value="final_payment">On final payment</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={busy} className="hub-chip" onClick={() => onSave(rate === '' ? null : Number(rate), (trig || null) as EarnTrigger | null)}>Save</button>
            <PressButton disabled={busy || p.earnedCents <= 0 || p.kycStatus !== 'approved'} onClick={onPay}>Pay {money(p.earnedCents, cur)}</PressButton>
          </div>
          {p.kycStatus !== 'approved' && <p className="text-xs text-[var(--dashboard-text-muted)] sm:col-span-3">Whop pays out only after the planner finishes identity verification.</p>}
        </div>
      </Presence>
    </li>
  )
}

function EventItem({ e, cur, planners, open, onToggle, onSave, busy }: {
  e: EventLedgerRow; cur: string; planners: PlannerLedgerRow[]; open: boolean; busy: boolean
  onToggle: () => void; onSave: (plannerId: string, rate: number | null, trig: EarnTrigger | null) => void
}) {
  const [planner, setPlanner] = useState(e.plannerId)
  const [rate, setRate] = useState(e.rateOverrideBps == null ? '' : String(e.rateOverrideBps / 100))
  const [trig, setTrig] = useState<string>(e.triggerOverride ?? '')
  return (
    <li>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--dashboard-card-hover)]">
        <div className="min-w-0">
          <p className="truncate font-medium">{e.title}</p>
          <p className="mt-0.5 text-xs text-[var(--dashboard-text-muted)]">{shortDate(e.eventDate)} · {e.plannerName} · {pct(e.rateBps)}{e.rateOverrideBps != null && ' override'}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm tabular-nums">{money(e.commissionCents, cur)}</span>
          <StateChip state={e.state} />
        </div>
      </button>
      <Presence show={open} id={`e-${e.leadId}`}>
        <div className="grid gap-4 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] px-4 py-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <p className="text-xs tabular-nums text-[var(--dashboard-text-muted)] sm:col-span-4">Collected {money(e.collectedCents, cur)} · {triggerLabel(e.earnTrigger)}</p>
          <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Planner
            <select className="plan-field" value={planner} onChange={(x) => setPlanner(x.target.value)}>
              {planners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Rate override (%)
            <input className="plan-field tabular-nums" inputMode="decimal" placeholder="Planner rate" value={rate} onChange={(x) => setRate(x.target.value)} />
          </label>
          <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Earned
            <select className="plan-field" value={trig} onChange={(x) => setTrig(x.target.value)}>
              <option value="">Planner default</option>
              <option value="deposit">On deposit</option>
              <option value="final_payment">On final payment</option>
            </select>
          </label>
          <button type="button" disabled={busy} className="hub-chip" onClick={() => onSave(planner, rate === '' ? null : Number(rate), (trig || null) as EarnTrigger | null)}>Save</button>
        </div>
      </Presence>
    </li>
  )
}

function Rules({ data, busy, onSave }: { data: LedgerData; busy: boolean; onSave: (rate: number, trig: EarnTrigger, auto: boolean) => void }) {
  const [rate, setRate] = useState(String(data.settings.defaultRateBps / 100))
  const [trig, setTrig] = useState<EarnTrigger>(data.settings.earnTrigger)
  const [auto, setAuto] = useState(data.settings.autoTransfer)
  return (
    <div className="grid max-w-xl gap-5 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
      <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Default commission (%)
        <input className="plan-field tabular-nums" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
      </label>
      <fieldset>
        <legend className="text-xs font-medium text-[var(--dashboard-text-muted)]">Commission is earned</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(['final_payment', 'deposit'] as const).map((t) => (
            <button key={t} type="button" aria-pressed={trig === t} onClick={() => setTrig(t)}
              className={`plan-choice transition-colors ${trig === t ? 'border-[var(--theme-dark)] bg-[var(--dashboard-surface)]' : ''}`}>
              {triggerLabel(t)}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" className="size-5 accent-[var(--theme-dark)]" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
        Transfer to the planner&apos;s Whop balance as soon as it&apos;s earned
      </label>
      <p className="text-xs text-[var(--dashboard-text-muted)]">Refunds reverse commission. An open chargeback holds it until it&apos;s resolved.</p>
      <PressButton disabled={busy} onClick={() => onSave(Number(rate), trig, auto)}>Save rules</PressButton>
    </div>
  )
}
