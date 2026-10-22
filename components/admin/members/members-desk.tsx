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
        { label: 'Past due', value: String(data.members.filter((m) => m.status === 'past_due').length), note: 'Stripe is retrying' },
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

      {tab === 'rules' && <Rules data={data} busy={pending} onSave={(d, dep) => run('Cart rules saved', () => updateCartLimits({ maxDiscountPct: d, defaultDepositPct: dep }))} />}
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

function Rules({ data, busy, onSave }: { data: MembersDeskData; busy: boolean; onSave: (maxDiscount: number, deposit: number) => void }) {
  const [d, setD] = useState(String(data.limits.maxLineDiscountBps / 100))
  const [dep, setDep] = useState(String(data.limits.defaultDepositBps / 100))
  return (
    <div className="grid max-w-xl gap-5 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
      <p className="text-sm">Member discount: <strong>50%</strong> on eligible rentals, only while the membership is active. It never stacks with other discounts.</p>
      <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Max client discount on non-member lines (%)
        <input className="plan-field tabular-nums" inputMode="decimal" value={d} onChange={(e) => setD(e.target.value)} />
      </label>
      <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">Default deposit (%)
        <input className="plan-field tabular-nums" inputMode="decimal" value={dep} onChange={(e) => setDep(e.target.value)} />
      </label>
      <PressButton disabled={busy} onClick={() => onSave(Number(d), Number(dep))}>Save rules</PressButton>
    </div>
  )
}
