'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Plus } from 'lucide-react'
import { PanelTabs } from '@/components/admin/panel-tabs'
import { Figures, Notice, PressButton, StateChip, money, shortDate } from '@/components/admin/carts/parts'
import { createInvoice, upsertClient } from '@/lib/invoices/actions'
import type { DisplayStatus } from '@/lib/invoices/math'
import type { ClientView, InvoiceSummary } from '@/lib/invoices/types'

const TABS = ['invoices', 'clients'] as const
const FILTERS = ['all', 'draft', 'open', 'overdue', 'paid', 'void'] as const
const EASE = [0.23, 1, 0.32, 1] as const

export function InvoicesDashboard({ invoices, clients, canInvoice, showPlanner = false, demo = false }: {
  invoices: InvoiceSummary[]; clients: ClientView[]; canInvoice: boolean; showPlanner?: boolean; demo?: boolean
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('invoices')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const shown = useMemo(() => invoices.filter((i) => filter === 'all' || i.display === filter), [invoices, filter])
  const sum = (d: DisplayStatus) => invoices.filter((i) => i.display === d).reduce((a, i) => a + i.totalCents - i.paidCents, 0)
  const paid = invoices.reduce((a, i) => a + i.paidCents, 0)

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-5">
        {!canInvoice && (
          <Notice>Invoicing is included with an active planner membership. Open invoices you already sent stay payable. <Link className="underline" href="/planners/membership">Membership</Link></Notice>
        )}
        <Figures items={[
          { label: 'Outstanding', value: money(sum('open')) },
          { label: 'Overdue', value: money(sum('overdue')), accent: sum('overdue') > 0 },
          { label: 'Collected', value: money(paid) },
        ]} />
        <PanelTabs tabs={TABS} value={tab} onChange={setTab} label="Invoicing" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: EASE }} className="flex flex-col gap-4">
            {tab === 'invoices' ? (
              <>
                <NewInvoice clients={clients} disabled={!canInvoice} demo={demo} />
                <div role="radiogroup" aria-label="Filter by status" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
                  {FILTERS.map((f) => (
                    <button key={f} type="button" role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}
                      className={`hub-chip min-h-11 shrink-0 capitalize transition-colors duration-150 ${filter === f ? '!border-[var(--theme-dark)] bg-[var(--dashboard-surface)] text-[var(--dashboard-text)]' : ''}`}>
                      {f}{f !== 'all' && <span className="ml-1.5 tabular-nums text-[var(--dashboard-text-muted)]">{invoices.filter((i) => i.display === f).length}</span>}
                    </button>
                  ))}
                </div>
                <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
                  {shown.map((i) => (
                    <li key={i.id}>
                      <Link href={`/admin/invoices/${i.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-4 transition-colors hover:bg-[var(--dashboard-card-hover)] active:bg-[var(--dashboard-surface)]">
                        <span className="min-w-0 truncate font-medium">{i.clientName}</span>
                        <span className="text-right text-sm tabular-nums">{money(i.totalCents)}</span>
                        <span className="min-w-0 truncate text-xs text-[var(--dashboard-text-muted)]">
                          {i.title}{i.dueDate ? ` · due ${shortDate(i.dueDate)}` : ''}{showPlanner ? ` · ${i.plannerName}` : ''}
                        </span>
                        <span className="justify-self-end"><StateChip state={i.display} /></span>
                      </Link>
                    </li>
                  ))}
                  {shown.length === 0 && <li className="px-4 py-10 text-center text-sm text-[var(--dashboard-text-muted)]">No {filter === 'all' ? '' : `${filter} `}invoices yet.</li>}
                </ul>
              </>
            ) : (
              <Clients clients={clients} disabled={!canInvoice} demo={demo} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

function NewInvoice({ clients, disabled, demo }: { clients: ClientView[]; disabled: boolean; demo: boolean }) {
  const [client, setClient] = useState(clients[0]?.id ?? '')
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const go = () => {
    if (demo) { router.push('/preview/invoice-editor'); return }
    start(async () => { const r = await createInvoice(client); if (r.ok) router.push(`/admin/invoices/${r.id}`); else setErr(r.error) })
  }
  return (
    <div className="grid gap-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">New invoice for
        <select className="plan-field" value={client} disabled={disabled} onChange={(e) => setClient(e.target.value)}>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` · ${c.company}` : ''}</option>)}
          {clients.length === 0 && <option value="">Add a client first</option>}
        </select>
      </label>
      <PressButton disabled={disabled || !client || pending} onClick={go}><Plus className="mr-1 inline size-4" />New invoice</PressButton>
      {err && <p role="alert" className="text-xs text-[var(--dashboard-accent-red)] sm:col-span-2">{err}</p>}
    </div>
  )
}

function Clients({ clients, disabled, demo }: { clients: ClientView[]; disabled: boolean; demo: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [msg, setMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const router = useRouter()
  const save = () => {
    if (demo) { setMsg('Preview: client would be saved'); return }
    start(async () => {
      const r = await upsertClient(form)
      if (r.ok) { setForm({ name: '', email: '', phone: '', company: '' }); setMsg('Client saved'); router.refresh() } else setMsg(r.error)
    })
  }
  const field = (k: keyof typeof form, label: string, type = 'text') => (
    <label className="text-xs font-medium text-[var(--dashboard-text-muted)]">{label}
      <input className="plan-field" type={type} value={form[k]} disabled={disabled} onChange={(e) => setForm({ ...form, [k]: e.target.value })} autoComplete="off" />
    </label>
  )
  return (
    <>
      <ul className="divide-y divide-[var(--dashboard-border)] border-y border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
        {clients.map((c) => (
          <li key={c.id} className="grid grid-cols-[1fr_auto] gap-x-3 px-4 py-4">
            <span className="min-w-0 truncate font-medium">{c.name}</span>
            <span className="text-right text-sm tabular-nums">{c.openCents ? `${money(c.openCents)} open` : '—'}</span>
            <span className="min-w-0 truncate text-xs text-[var(--dashboard-text-muted)]">{[c.company, c.email].filter(Boolean).join(' · ')}</span>
            <span className="text-right text-xs tabular-nums text-[var(--dashboard-text-muted)]">{c.invoiceCount} invoice{c.invoiceCount === 1 ? '' : 's'}</span>
          </li>
        ))}
        {clients.length === 0 && <li className="px-4 py-10 text-center text-sm text-[var(--dashboard-text-muted)]">No clients yet.</li>}
      </ul>
      <section aria-labelledby="add-client" className="grid gap-3 border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4">
        <h2 id="add-client" className="font-serif text-xl">Add a client</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {field('name', 'Name')}{field('email', 'Email', 'email')}{field('phone', 'Phone (optional)', 'tel')}{field('company', 'Company (optional)')}
        </div>
        <PressButton disabled={disabled || pending || !form.name || !form.email} onClick={save}>Save client</PressButton>
        {msg && <p role="status" className="text-xs text-[var(--dashboard-text-muted)]">{msg}</p>}
      </section>
    </>
  )
}
