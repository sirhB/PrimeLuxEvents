'use client'

import { useState, useTransition } from 'react'
import { PanelTabs } from '@/components/admin/panel-tabs'
import { Presence } from '@/components/motion/presence'
import { assignPlannerToEvent, setEligibility, terminateMemberForSharing } from '@/lib/membership/actions'
import { updateCartLimits } from '@/lib/carts/actions'
import type { MembersDeskData, MemberRow } from '@/lib/membership/admin-types'
import { Figures, PressButton, StateChip, money, shortDate } from '@/components/admin/carts/parts'

const TABS = ['members', 'eligibility', 'rules'] as const
type Tab = (typeof TABS)[number]

export function MembersDesk({ data, demo = false, initialTab = 'members' }: { data: MembersDeskData; demo?: boolean; initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [flash, setFlash] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const run = (label: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    if (demo) { setFlash(`${label} (preview: nothing saved)`); return }
    start(async () => { const r = await fn(); setFlash(r.ok ? label : r.error ?? 'Something went wrong') })
  }
  const active = data.members.filter((m) => m.status === 'active').length

  return (
    <div className="flex flex-col gap-6">
      <Figures items={[
        { label: 'Active members', value: String(active), note: `${money(active * 9900)}/mo` },
        { label: 'Past due', value: String(data.members.filter((m) => m.status === 'past_due' || m.status === 'balance_due').length), note: 'Incl. canceled with balance due' },
        { label: 'Banned', value: String(data.members.filter((m) => m.banned).length), note: 'Permanent' },
        { label: 'Assigned events', value: String(data.leads.filter((l) => l.plannerId).length) },
      ]} />
      <Presence show={!!flash} id={flash ?? ''}><p role="status" className="text-sm text-[var(--dashboard-text-muted)]">{flash}</p></Presence>
      <PanelTabs tabs={TABS} value={tab} onChange={setTab} label="Planner membership" />

      {tab === 'members' && (
        <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
          {data.members.map((m) => <Member key={m.id} m={m} data={data} busy={pending} run={run} />)}
          {data.members.length === 0 && <li className="p-6 text-sm text-[var(--dashboard-text-muted)]">No members yet.</li>}
        </ul>
      )}

      {tab === 'eligibility' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--dashboard-text-muted)]">Categories</h3>
            <ul className="mt-2 divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
              {data.categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2">
                  <span className="text-sm">{c.name}</span>
                  <RuleToggle value={c.rule} onChange={(v) => run(`${c.name} updated`, () => setEligibility('category', c.id, v))} />
                </li>
              ))}
            </ul>
          </section>
          <ProductRules data={data} run={run} />
        </div>
      )}

      {tab === 'rules' && <Rules data={data} busy={pending} onSave={(v) => run('Rules saved', () => updateCartLimits(v))} />}
    </div>
  )
}

function Member({ m, data, busy, run }: { m: MemberRow; data: MembersDeskData; busy: boolean; run: (l: string, fn: () => Promise<{ ok: boolean; error?: string }>) => void }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [lead, setLead] = useState(data.leads.find((l) => !l.plannerId)?.id ?? data.leads[0]?.id ?? '')
  return (
    <li>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--dashboard-card-hover)]">
        <span className="min-w-0">
          <span className="block truncate font-medium">{m.name}</span>
          <span className="mt-0.5 block truncate text-xs text-[var(--dashboard-text-muted)]">
            {m.status === 'terminated' ? `Banned · ${m.terminatedReason === 'sharing' ? 'account sharing' : 'nonpayment'}` : m.periodEnd ? `Renews ${shortDate(m.periodEnd)}` : m.email} · {m.eventCount} events
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <StateChip state={m.status} />
        </span>
      </button>
      <Presence show={open} id={`m-${m.id}`}>
        <div className="grid gap-4 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] px-4 py-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Assign a client event
              <select className="plan-field" value={lead} onChange={(e) => setLead(e.target.value)}>
                {data.leads.map((l) => <option key={l.id} value={l.id}>{l.title}{l.plannerId && l.plannerId !== m.id ? ' (assigned)' : l.plannerId === m.id ? ' (theirs)' : ''}</option>)}
              </select>
            </label>
            <button type="button" className="hub-chip" disabled={busy || !lead || m.banned} onClick={() => run(`Assigned to ${m.name}`, () => assignPlannerToEvent(lead, m.id))}>Assign</button>
          </div>
          {!m.banned && (
            <div className="border border-[color-mix(in_srgb,var(--dashboard-accent-red)_30%,transparent)] p-3">
              <p className="text-sm font-medium text-[var(--dashboard-accent-red)]">Terminate for sharing</p>
              <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">Cancels the subscription now with no refund and permanently bans this planner from rejoining. This can’t be undone.</p>
              <div className="mt-3 flex gap-2">
                <input aria-label="Type TERMINATE to confirm" className="plan-field !mt-0 flex-1" placeholder="Type TERMINATE" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                <button type="button" disabled={busy || confirm.trim().toUpperCase() !== 'TERMINATE'}
                  className="min-h-11 bg-[var(--dashboard-accent-red)] px-4 text-sm font-medium text-white transition-transform active:scale-[0.97] disabled:opacity-40"
                  onClick={() => run(`${m.name} terminated and banned`, () => terminateMemberForSharing(m.id, confirm))}>Terminate</button>
              </div>
            </div>
          )}
        </div>
      </Presence>
    </li>
  )
}

function RuleToggle({ value, onChange }: { value: boolean | null; onChange: (v: boolean | null) => void }) {
  const opts: { v: boolean | null; label: string }[] = [{ v: true, label: 'Eligible' }, { v: false, label: 'No' }, { v: null, label: 'Inherit' }]
  return (
    <div role="radiogroup" className="flex border border-[var(--dashboard-border)] text-xs">
      {opts.map((o) => (
        <button key={String(o.v)} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
          className={`h-11 px-2.5 transition-colors ${value === o.v ? 'bg-[var(--theme-dark)] text-white' : 'bg-white'}`}>{o.label}</button>
      ))}
    </div>
  )
}

function ProductRules({ data, run }: { data: MembersDeskData; run: (l: string, fn: () => Promise<{ ok: boolean; error?: string }>) => void }) {
  const [q, setQ] = useState('')
  const shown = data.products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 80)
  return (
    <section>
      <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--dashboard-text-muted)]">Products (override category)</h3>
      <input aria-label="Search products" className="plan-field" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-2 divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
        {shown.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2">
            <span className="min-w-0">
              <span className="block truncate text-sm">{p.name}</span>
              <span className="block text-[11px] text-[var(--dashboard-text-muted)]">{p.categoryName} · {p.effective ? 'member 50%' : 'full price'}</span>
            </span>
            <RuleToggle value={p.rule} onChange={(v) => run(`${p.name} updated`, () => setEligibility('product', p.id, v))} />
          </li>
        ))}
      </ul>
    </section>
  )
}

type RulesInput = Parameters<typeof updateCartLimits>[0]

function Rules({ data, busy, onSave }: { data: MembersDeskData; busy: boolean; onSave: (v: RulesInput) => void }) {
  const L = data.limits
  const opt = (c: number | null) => (c == null ? '' : String(c / 100))
  const [d, setD] = useState(String(L.maxLineDiscountBps / 100))
  const [dep, setDep] = useState(String(L.defaultDepositBps / 100))
  const [pct, setPct] = useState(String(L.platformFee.bps / 100))
  const [flat, setFlat] = useState(String(L.platformFee.flatCents / 100))
  const [min, setMin] = useState(opt(L.platformFee.minCents))
  const [cap, setCap] = useState(opt(L.platformFee.capCents))
  const [mf, setMf] = useState(L.marketplaceFacilitator)
  const num = (v: string) => Number(v.replace(/[^0-9.]/g, '') || 0)
  const optNum = (v: string) => (v.trim() === '' ? null : num(v))
  const field = (label: string, v: string, set: (s: string) => void, placeholder?: string) => (
    <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">{label}
      <input className="plan-field tabular-nums" inputMode="decimal" placeholder={placeholder} value={v} onChange={(e) => set(e.target.value)} />
    </label>
  )
  return (
    <div className="grid max-w-xl gap-5 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
      <p className="text-sm">Member discount: <strong>50%</strong> on eligible rentals, only while the membership is active. It never stacks with other discounts. This is the only planner discount.</p>
      {field('Max client discount on non-member lines (%)', d, setD)}
      {field('Default deposit (%)', dep, setDep)}

      <fieldset className="grid gap-3 border-t border-[var(--dashboard-border)] pt-4">
        <legend className="font-serif text-xl">Prime Lux platform fee</legend>
        <p className="text-xs leading-relaxed text-[var(--dashboard-text-muted)]">Charged on every payment a planner collects (carts and invoices, including their own services), added to Prime Lux’s rental share in the application fee. It comes out of the planner’s proceeds only: clients never see it and pay the same however they pay (CT surcharge rule). Default 0.</p>
        <div className="grid grid-cols-2 gap-3">
          {field('Percentage (%)', pct, setPct)}
          {field('Flat per payment ($)', flat, setFlat)}
          {field('Minimum ($, optional)', min, setMin, 'None')}
          {field('Cap ($, optional)', cap, setCap, 'None')}
        </div>
      </fieldset>

      <fieldset className="grid gap-2 border-t border-[var(--dashboard-border)] pt-4">
        <legend className="font-serif text-xl">Sales tax</legend>
        <label className="flex min-h-11 items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[var(--theme-dark)]" checked={mf} onChange={(e) => setMf(e.target.checked)} />
          <span>Prime Lux collects sales tax as a marketplace facilitator<span className="mt-1 block text-xs text-[var(--dashboard-text-muted)]">Off by default. When on, Prime Lux’s share includes tax on its rentals. Needs CPA review first: CT marketplace facilitator rule (CGS 12-408e, $250k threshold). Changes are logged.</span></span>
        </label>
      </fieldset>

      <PressButton disabled={busy} onClick={() => onSave({
        maxDiscountPct: num(d), defaultDepositPct: num(dep), platformFeePct: num(pct), platformFeeFlat: num(flat),
        platformFeeMin: optNum(min), platformFeeCap: optNum(cap), marketplaceFacilitator: mf,
      })}>Save rules</PressButton>
    </div>
  )
}
