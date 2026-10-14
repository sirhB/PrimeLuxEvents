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
} from '@/lib/venues/desk'
import { useDesk } from '@/components/admin/venue/use-desk'
import { cn } from '@/lib/utils'

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
  const leads = useMemo(() => filterLeads(api.desk, view), [api.desk, view])
  const owners = [...new Set(api.desk.leads.map((lead) => lead.owner_name))]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(['board', 'contacts', 'calendar', 'reports'] as const).map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={cn('min-h-10 border px-3 text-[11px] uppercase tracking-[0.16em]', tab === item ? 'border-[var(--theme-dark)] bg-[var(--theme-dark)] text-[var(--theme-on-dark)]' : 'border-[var(--dashboard-border)] bg-white')}>
            {item}
          </button>
        ))}
      </div>
      {api.message && <p className="text-sm text-[var(--dashboard-text-muted)]">{api.message}</p>}

      {tab === 'board' && (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <input value={view.query} onChange={(event) => setView((current) => ({ ...current, query: event.target.value }))} placeholder="Search contacts, companies, rooms" className="plan-field" />
            <select className="plan-field" value={view.stage} onChange={(event) => setView((current) => ({ ...current, stage: event.target.value as PipelineStage | 'all' }))}>
              <option value="all">All stages</option>
              {PIPELINE_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
            </select>
            <select className="plan-field" value={view.source} onChange={(event) => setView((current) => ({ ...current, source: event.target.value }))}>
              <option value="all">All sources</option>
              {[...new Set(api.desk.leads.map((lead) => lead.source))].map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
            <select className="plan-field" value={view.owner} onChange={(event) => setView((current) => ({ ...current, owner: event.target.value }))}>
              <option value="all">All owners</option>
              {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {api.desk.views.map((saved) => (
              <button key={saved.id} type="button" className="min-h-9 border border-[var(--dashboard-border)] bg-white px-3 text-[11px] uppercase tracking-[0.14em]" onClick={() => setView(saved)}>
                {saved.name}
              </button>
            ))}
            <input value={viewName} onChange={(event) => setViewName(event.target.value)} placeholder="Name this view" className="plan-field max-w-[12rem]" />
            <button
              type="button"
              className="lux-cta !min-h-10"
              onClick={() => {
                if (!viewName.trim()) return
                api.saveView({ name: viewName.trim(), ...view })
                setViewName('')
              }}
            >
              Save view
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage) => {
              const column = leads.filter((lead) => lead.stage === stage.id)
              return (
                <section key={stage.id} className="w-64 shrink-0 border border-[var(--dashboard-border)] bg-white">
                  <h2 className="border-b border-[var(--dashboard-border)] px-3 py-2 text-[11px] uppercase tracking-[0.16em]">
                    {stage.label}
                    <span className="ml-2 text-[var(--dashboard-text-muted)]">{column.length}</span>
                  </h2>
                  <div className="space-y-2 p-2">
                    {column.map((lead) => {
                      const contact = api.desk.contacts.find((item) => item.id === lead.contact_id)
                      const company = api.desk.companies.find((item) => item.id === lead.company_id)
                      return (
                        <article key={lead.id} className="border border-[var(--dashboard-border)] p-3">
                          <Link href={`${leadBase}/${lead.id}`} className="font-medium">{contact?.name}</Link>
                          <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">{company?.name || 'Private client'} · {lead.source}</p>
                          <p className="mt-1 text-xs">{lead.venue_name || 'Venue open'} · {lead.event_date || 'Date open'}</p>
                          <p className="mt-2 font-serif text-lg">{formatCurrency(lead.value_cents)}</p>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">{lead.owner_name}</p>
                          <label className="mt-2 block text-[10px] uppercase tracking-[0.14em]">
                            Stage
                            <select className="plan-field" value={lead.stage} onChange={(event) => api.setStage(lead.id, event.target.value as PipelineStage)}>
                              {PIPELINE_STAGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                            </select>
                          </label>
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
              <h2 className="font-serif text-3xl">{company.name}</h2>
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
            <h2 className="font-serif text-3xl">People without a company</h2>
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
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">Pipeline value</p>
            <p className="mt-2 font-serif text-4xl">{formatCurrency(pipelineValue(api.desk.leads))}</p>
          </article>
          <article className="border border-[var(--dashboard-border)] bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">Conversion</p>
            <p className="mt-2 font-serif text-4xl">{Math.round(conversionRate(api.desk.leads) * 100)}%</p>
            <p className="text-sm text-[var(--dashboard-text-muted)]">Deposit, booked, or completed.</p>
          </article>
          <article className="border border-[var(--dashboard-border)] bg-white p-4 md:col-span-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">By source</p>
            <ul className="mt-3 space-y-2 text-sm">
              {sourceBreakdown(api.desk.leads).map((row) => (
                <li key={row.source} className="flex justify-between gap-3 border-t border-[var(--dashboard-border)] pt-2">
                  <span className="uppercase tracking-[0.12em]">{row.source}</span>
                  <span>{row.count} · {formatCurrency(row.value)}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="border border-[var(--dashboard-border)] bg-white p-4 md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">Upcoming events</p>
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
