'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
  PIPELINE_STAGES,
  contactName,
  conversionRate,
  filterLeads,
  pipelineValue,
  sourceBreakdown,
  type DeskWorkspace,
  type PipelineStage,
  type SavedView,
  type CartFilter,
} from '@/lib/venues/desk'
import { useDesk } from '@/components/admin/venue/use-desk'
import { cn } from '@/lib/utils'
import { Presence } from '@/components/motion/presence'

type DeskApi = ReturnType<typeof useDesk>

export function CrmDesk({
  initial,
  leadBase,
  live = false,
}: {
  initial: DeskWorkspace
  leadBase: string
  live?: boolean
}) {
  const api = useDesk(initial, live)
  const [tab, setTab] = useState<'board' | 'contacts' | 'calendar' | 'reports'>('board')
  const [view, setView] = useState<Pick<SavedView, 'stage' | 'source' | 'owner' | 'query'>>({ stage: 'all', source: 'all', owner: 'all', query: '' })
  const [viewName, setViewName] = useState('')
  const [cartFilter, setCartFilter] = useState<CartFilter>('all')
  const [abandonDays, setAbandonDays] = useState(initial.abandon_days ?? 3)
  const leads = useMemo(() => filterLeads(api.desk, { ...view, cart: cartFilter, abandonDays }), [api.desk, view, cartFilter, abandonDays])
  const owners = [...new Set(api.desk.leads.map((lead) => lead.owner_name))]

  const savedAbandonDays = api.desk.abandon_days ?? 3
  const today = new Date().toISOString().slice(0, 10)
  const openReminders = api.desk.reminders.filter((item) => !item.done)
  const dueReminders = openReminders.filter((item) => item.due_on <= today)
  const openLeads = api.desk.leads.filter((lead) => lead.stage !== 'lost' && lead.stage !== 'completed')
  const filtersOn = cartFilter !== 'all' || view.stage !== 'all' || view.source !== 'all' || view.owner !== 'all' || view.query !== ''

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--dashboard-text-muted)]">
        <span className="font-medium tabular-nums text-[var(--dashboard-text)]">{openLeads.length}</span> open ·{' '}
        <span className="font-medium tabular-nums text-[var(--dashboard-text)]">{formatCurrency(pipelineValue(api.desk.leads))}</span> in pipeline ·{' '}
        <span className="font-medium tabular-nums text-[var(--dashboard-text)]">{Math.round(conversionRate(api.desk.leads) * 100)}%</span> converted
      </p>

      {dueReminders.length > 0 && (
        <section aria-label="Follow-ups due" className="border-l-2 border-[var(--dashboard-accent-gold)] bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">Follow-ups due · {dueReminders.length}</p>
          <ul className="mt-2 space-y-1 text-sm">
            {dueReminders.slice(0, 5).map((item) => {
              const lead = api.desk.leads.find((row) => row.id === item.lead_id)
              return (
                <li key={item.id} className="truncate">
                  <Link href={`${leadBase}/${item.lead_id}`} className="underline-offset-4 hover:underline">{lead ? contactName(api.desk, lead.contact_id) : 'Lead'}</Link>
                  <span className="text-[var(--dashboard-text-muted)]"> · <span className="tabular-nums">{item.due_on}</span> · {item.body}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div role="tablist" aria-label="Venue desk" className="-mx-4 flex overflow-x-auto border-b border-[var(--dashboard-border)] px-4 md:mx-0 md:px-0">
        {(['board', 'contacts', 'calendar', 'reports'] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={cn(
              'relative min-h-11 shrink-0 px-4 text-sm capitalize transition-colors',
              tab === item ? 'font-medium text-[var(--dashboard-text)] after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-[var(--theme-dark)]' : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]',
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <Presence show={Boolean(api.message)} id={api.message || undefined}>
        <p role="status" className="text-sm text-[var(--dashboard-text-muted)]">{api.message}</p>
      </Presence>

      {tab === 'board' && (
        <>
          <div className="space-y-3">
            <label className="sr-only" htmlFor="crm-search">Search</label>
            <input id="crm-search" type="search" value={view.query} onChange={(event) => setView((current) => ({ ...current, query: event.target.value }))} placeholder="Search contacts, companies, rooms" className="plan-field !mt-0" />
            <div className="grid grid-cols-3 gap-2">
              <select aria-label="Stage" className="plan-field !mt-0 !text-sm" value={view.stage} onChange={(event) => setView((current) => ({ ...current, stage: event.target.value as PipelineStage | 'all' }))}>
                <option value="all">All stages</option>
                {PIPELINE_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
              </select>
              <select aria-label="Source" className="plan-field !mt-0 !text-sm" value={view.source} onChange={(event) => setView((current) => ({ ...current, source: event.target.value }))}>
                <option value="all">All sources</option>
                {[...new Set(api.desk.leads.map((lead) => lead.source))].map((source) => <option key={source} value={source}>{source}</option>)}
              </select>
              <select aria-label="Owner" className="plan-field !mt-0 !text-sm" value={view.owner} onChange={(event) => setView((current) => ({ ...current, owner: event.target.value }))}>
                <option value="all">All owners</option>
                {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label="Cart" className="plan-field !mt-0 !w-auto !text-sm" value={cartFilter} onChange={(event) => setCartFilter(event.target.value as CartFilter)}>
                <option value="all">Any cart</option>
                <option value="has_cart">Has a cart</option>
                <option value="open">Cart open</option>
                <option value="abandoned">Cart abandoned</option>
                <option value="checked_out">Checked out</option>
                <option value="none">No cart</option>
              </select>
              {cartFilter === 'abandoned' && (
                <label className="flex items-center gap-2 text-xs text-[var(--dashboard-text-muted)]">
                  No checkout after
                  <input type="number" min={1} max={60} value={abandonDays} onChange={(event) => setAbandonDays(Math.max(1, Number(event.target.value) || 3))} className="plan-field !mt-0 !w-16 !text-sm" />
                  days
                  {abandonDays !== savedAbandonDays ? (
                    <button type="button" className="text-xs font-medium text-[var(--dashboard-text)] underline underline-offset-4" onClick={() => api.setAbandonDays(abandonDays)}>Save as default</button>
                  ) : (
                    <span>(default)</span>
                  )}
                </label>
              )}
            </div>
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
              <span className="shrink-0 text-xs text-[var(--dashboard-text-muted)]">Views</span>
              {api.desk.views.map((saved) => (
                <button key={saved.id} type="button" className="hub-chip !min-h-9 shrink-0" onClick={() => setView(saved)}>
                  {saved.name}
                </button>
              ))}
              {filtersOn && (
                <button type="button" className="shrink-0 text-xs underline underline-offset-4" onClick={() => { setCartFilter('all'); setView({ stage: 'all', source: 'all', owner: 'all', query: '' }) }}>Clear</button>
              )}
              <form
                className="ml-auto flex shrink-0 items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!viewName.trim()) return
                  api.saveView({ name: viewName.trim(), ...view })
                  setViewName('')
                }}
              >
                <input aria-label="View name" value={viewName} onChange={(event) => setViewName(event.target.value)} placeholder="Save as…" className="plan-field !mt-0 !min-h-9 w-32 !py-1 !text-sm" />
                <button type="submit" className="hub-chip !min-h-9">Save view</button>
              </form>
            </div>
          </div>
          <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
            {PIPELINE_STAGES.map((stage) => {
              const column = leads.filter((lead) => lead.stage === stage.id)
              const total = column.reduce((sum, lead) => sum + lead.value_cents, 0)
              return (
                <section key={stage.id} aria-label={stage.label} className="w-[82vw] max-w-[17rem] shrink-0 snap-start md:w-64">
                  <h2 className="flex items-baseline justify-between gap-2 border-b-2 border-[var(--theme-dark)] pb-2 text-sm font-medium">
                    <span>{stage.label} <span className="font-normal tabular-nums text-[var(--dashboard-text-muted)]">{column.length}</span></span>
                    <span className="text-xs font-normal tabular-nums text-[var(--dashboard-text-muted)]">{total ? formatCurrency(total) : ''}</span>
                  </h2>
                  <div className="space-y-2 pt-2">
                    {column.length === 0 && <p className="py-4 text-xs text-[var(--dashboard-text-muted)]">No leads here.</p>}
                    {column.map((lead) => {
                      const contact = api.desk.contacts.find((item) => item.id === lead.contact_id)
                      const company = api.desk.companies.find((item) => item.id === lead.company_id)
                      return (
                        <article key={lead.id} className="border border-[var(--dashboard-border)] bg-white p-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <Link href={`${leadBase}/${lead.id}`} className="truncate font-medium underline-offset-4 hover:underline">{contact?.name}</Link>
                            <span className="shrink-0 text-sm tabular-nums">{formatCurrency(lead.value_cents)}</span>
                          </div>
                          <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">{company?.name || 'Private client'} · {lead.source}</p>
                          {(() => {
                            const next = openReminders.find((item) => item.lead_id === lead.id)
                            if (!next) return null
                            const due = next.due_on <= today
                            return (
                              <p className={cn('mt-1 truncate text-xs', due ? 'font-medium text-[var(--destructive)]' : 'text-[var(--dashboard-text-muted)]')}>
                                Follow up {due ? 'due ' : ''}<span className="tabular-nums">{next.due_on}</span> · {next.body}
                              </p>
                            )
                          })()}
                          <p className="mt-0.5 text-xs">{lead.venue_name || 'Venue open'} · <span className="tabular-nums">{lead.event_date || 'Date open'}</span></p>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-[var(--dashboard-text-muted)]">{lead.owner_name}</span>
                            <select aria-label={`Stage for ${contact?.name || 'lead'}`} className="min-h-9 border border-[var(--dashboard-border)] bg-white px-2 text-xs" value={lead.stage} onChange={(event) => api.setStage(lead.id, event.target.value as PipelineStage)}>
                              {PIPELINE_STAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                            </select>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}

      {tab === 'contacts' && (
        <div className="grid gap-4 md:grid-cols-2">
          {api.desk.companies.map((company) => (
            <article key={company.id} className="border border-[var(--dashboard-border)] bg-white p-4">
              <h2 className="font-serif text-2xl">{company.name}</h2>
              <p className="text-sm text-[var(--dashboard-text-muted)]">{company.phone} {company.website ? `· ${company.website}` : ''}</p>
              <ul className="mt-4 space-y-2">
                {api.desk.contacts.filter((contact) => contact.company_id === company.id).map((contact) => (
                  <li key={contact.id} className="border-t border-[var(--dashboard-border)] pt-2 text-sm">
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-[var(--dashboard-text-muted)]"> · {contact.title || 'Contact'} · {contact.email}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <article className="border border-[var(--dashboard-border)] bg-white p-4">
            <h2 className="font-serif text-2xl">People without a company</h2>
            <ul className="mt-4 space-y-2">
              {api.desk.contacts.filter((contact) => !contact.company_id).map((contact) => (
                <li key={contact.id} className="text-sm">{contact.name} · {contact.email}</li>
              ))}
            </ul>
          </article>
        </div>
      )}

      {tab === 'calendar' && <CalendarPanel desk={api.desk} />}

      {tab === 'reports' && (
        <div className="grid gap-4 md:grid-cols-3">
          <article className="border border-[var(--dashboard-border)] bg-white p-4">
            <p className="text-sm text-[var(--dashboard-text-muted)]">Pipeline value</p>
            <p className="mt-1 font-serif text-4xl tabular-nums">{formatCurrency(pipelineValue(api.desk.leads))}</p>
          </article>
          <article className="border border-[var(--dashboard-border)] bg-white p-4">
            <p className="text-sm text-[var(--dashboard-text-muted)]">Conversion</p>
            <p className="mt-1 font-serif text-4xl tabular-nums">{Math.round(conversionRate(api.desk.leads) * 100)}%</p>
            <p className="text-sm text-[var(--dashboard-text-muted)]">Deposit, booked, or completed.</p>
          </article>
          <article className="border border-[var(--dashboard-border)] bg-white p-4 md:col-span-1">
            <p className="text-sm text-[var(--dashboard-text-muted)]">By source</p>
            <ul className="mt-3 space-y-2 text-sm">
              {sourceBreakdown(api.desk.leads).map((row) => (
                <li key={row.source} className="flex justify-between gap-3 border-t border-[var(--dashboard-border)] pt-2">
                  <span className="capitalize">{row.source}</span>
                  <span>{row.count} · {formatCurrency(row.value)}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="border border-[var(--dashboard-border)] bg-white p-4 md:col-span-3">
            <p className="text-sm text-[var(--dashboard-text-muted)]">Upcoming events</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2">
              {api.desk.leads.filter((lead) => lead.event_date && lead.stage !== 'lost' && lead.stage !== 'completed').map((lead) => (
                <li key={lead.id} className="text-sm">{lead.event_date} · {contactName(api.desk, lead.contact_id)} · {lead.venue_name || 'Venue open'}</li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </div>
  )
}

function CalendarPanel({ desk }: { desk: DeskWorkspace }) {
  const rows = [
    ...desk.tours.map((tour) => ({ id: tour.id, when: tour.starts_at.slice(0, 16).replace('T', ' '), label: `Tour · ${tour.venue_name}`, who: contactName(desk, desk.leads.find((lead) => lead.id === tour.lead_id)?.contact_id || '') })),
    ...desk.holds.map((hold) => ({ id: hold.id, when: `${hold.starts_on} – ${hold.ends_on}`, label: `Hold · ${hold.venue_name} · ${hold.status}`, who: contactName(desk, desk.leads.find((lead) => lead.id === hold.lead_id)?.contact_id || '') })),
  ]
  return (
    <div className="border border-[var(--dashboard-border)] bg-white">
      {rows.map((row) => (
        <div key={row.id} className="grid gap-1 border-b border-[var(--dashboard-border)] px-4 py-3 text-sm md:grid-cols-3">
          <span>{row.when}</span>
          <span>{row.label}</span>
          <span className="text-[var(--dashboard-text-muted)]">{row.who}</span>
        </div>
      ))}
    </div>
  )
}
