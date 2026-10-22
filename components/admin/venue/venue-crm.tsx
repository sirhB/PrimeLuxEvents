'use client'

import { useMemo, useState } from 'react'
import { Presence } from '@/components/motion/presence'
import { LEAD_STAGES, type LeadStage, type VenueDay, type VenueLeadRecord } from '@/lib/venues/crm'
import { VENUE_LISTINGS, resolveVenueId } from '@/lib/venues/directory'
import {
  addVenueNote,
  createVenueBooking,
  scheduleVenueTour,
  setVenueAvailability,
  updateLeadStage,
} from '@/app/admin/venue/actions'
import { cn } from '@/lib/utils'

export function VenueCrm({
  leads: initialLeads,
  days: initialDays,
  live,
  mode = 'full',
  bookings = [],
}: {
  leads: VenueLeadRecord[]
  days: VenueDay[]
  live: boolean
  /** `availability` shows only the room calendar (Venue desk → Availability). */
  mode?: 'full' | 'availability'
  /** Lead holds and confirmed bookings, shown read-only on the calendar. */
  bookings?: Array<{ id: string; venue_id: string | null; starts_on: string; ends_on: string; status: string }>
}) {
  const [leads, setLeads] = useState(initialLeads)
  const [days, setDays] = useState(initialDays)
  const [selectedId, setSelectedId] = useState(initialLeads[0]?.id ?? '')
  const [tab, setTab] = useState<'pipeline' | 'calendar'>(mode === 'availability' ? 'calendar' : 'pipeline')
  const [monthOffset, setMonthOffset] = useState(0)
  const [roomFilter, setRoomFilter] = useState<string>(VENUE_LISTINGS[0]?.id ?? '')
  const [message, setMessage] = useState('')
  const selected = leads.find((lead) => lead.id === selectedId) ?? null

  const month = useMemo(() => {
    const anchor = new Date()
    anchor.setDate(1)
    anchor.setMonth(anchor.getMonth() + monthOffset)
    return buildMonth(anchor)
  }, [monthOffset])

  async function run(task: () => Promise<void>, local: () => void) {
    setMessage('')
    local()
    if (!live) {
      setMessage('Updated on this screen. Apply the venue migration to keep it.')
      return
    }
    try {
      await task()
      setMessage('Saved.')
    } catch {
      setMessage('The change did not save.')
    }
  }

  return (
    <div className="space-y-5">
      {!live && mode === 'full' && (
        <p className="border border-[var(--dashboard-border)] bg-white px-4 py-3 text-sm text-[var(--dashboard-text-muted)]">
          Sample pipeline. Inquiries from the venue pages and Plan your event replace these once the migration is applied.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={cn('inline-flex border border-[var(--dashboard-border)] bg-white p-0.5', mode === 'availability' && 'hidden')}>
          {(['pipeline', 'calendar'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn('min-h-10 px-4 text-xs font-medium', tab === item && 'bg-[var(--theme-dark)] text-[var(--theme-on-dark)]')}
            >
              {item}
            </button>
          ))}
        </div>
        {message && <p className="text-sm text-[var(--dashboard-text-muted)]">{message}</p>}
      </div>

      {tab === 'pipeline' ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {LEAD_STAGES.map((stage) => (
              <section key={stage.id} className="w-64 shrink-0 border border-[var(--dashboard-border)] bg-white">
                <h2 className="border-b border-[var(--dashboard-border)] px-3 py-2 text-xs font-medium">
                  {stage.label}
                  <span className="ml-2 text-[var(--dashboard-text-muted)]">{leads.filter((lead) => lead.stage === stage.id).length}</span>
                </h2>
                <div className="space-y-2 p-2">
                  {leads.filter((lead) => lead.stage === stage.id).map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => setSelectedId(lead.id)}
                      className={cn('block w-full border px-3 py-3 text-left', selectedId === lead.id ? 'border-[var(--theme-dark)]' : 'border-transparent bg-[var(--dashboard-card-hover)]')}
                    >
                      <span className="block font-medium">{lead.contact_name}</span>
                      <span className="mt-1 block text-xs text-[var(--dashboard-text-muted)]">{lead.venue_name}</span>
                      <span className="mt-1 block text-xs">{lead.event_date || 'Date open'} · {lead.guest_count || '—'} guests</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <Presence show={Boolean(selected)} id={selected?.id}>{(selected) && (<>
            <aside className="border border-[var(--dashboard-border)] bg-white p-4">
              <p className="text-xs font-medium text-[var(--dashboard-text-muted)]">{selected.source || 'inquiry'}</p>
              <h2 className="mt-1 font-serif text-3xl">{selected.contact_name}</h2>
              <p className="mt-1 text-sm">{selected.contact_email}</p>
              <p className="text-sm text-[var(--dashboard-text-muted)]">{selected.contact_phone}</p>
              <label className="mt-4 block text-xs uppercase tracking-[0.16em]">
                Stage
                <select
                  className="plan-field"
                  value={selected.stage}
                  onChange={(event) => {
                    const stage = event.target.value as LeadStage
                    void run(
                      () => updateLeadStage(selected.id, stage),
                      () => setLeads((current) => current.map((lead) => lead.id === selected.id ? { ...lead, stage } : lead)),
                    )
                  }}
                >
                  {LEAD_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
                </select>
              </label>
              <div className="mt-4 space-y-2 text-sm">
                {selected.notes.map((note) => (
                  <p key={note.id} className="border-b border-[var(--dashboard-border)] pb-2">{note.body}</p>
                ))}
                {selected.tours.map((tour) => (
                  <p key={tour.id}>Tour {new Date(tour.starts_at).toLocaleString()}</p>
                ))}
                {selected.bookings.map((booking) => (
                  <p key={booking.id}>Hold {booking.starts_on} – {booking.ends_on}</p>
                ))}
              </div>
              <form
                className="mt-4 grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  const form = new FormData(event.currentTarget)
                  const body = String(form.get('body') || '')
                  if (!body.trim()) return
                  void run(
                    () => addVenueNote(selected.id, body),
                    () => setLeads((current) => current.map((lead) => lead.id === selected.id ? {
                      ...lead,
                      notes: [...lead.notes, { id: crypto.randomUUID(), body, author_name: 'You', created_at: new Date().toISOString() }],
                    } : lead)),
                  )
                  event.currentTarget.reset()
                }}
              >
                <textarea name="body" placeholder="Note" className="plan-field min-h-20" />
                <button type="submit" className="lux-cta !min-h-10">Add note</button>
              </form>
              <form
                className="mt-4 grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  const form = new FormData(event.currentTarget)
                  const starts = String(form.get('starts') || '')
                  if (!starts) return
                  void run(
                    () => scheduleVenueTour(selected.id, selected.venue_id, new Date(starts).toISOString()),
                    () => setLeads((current) => current.map((lead) => lead.id === selected.id ? {
                      ...lead,
                      stage: 'tour',
                      tours: [...lead.tours, { id: crypto.randomUUID(), starts_at: new Date(starts).toISOString(), status: 'scheduled', venue_id: lead.venue_id }],
                    } : lead)),
                  )
                }}
              >
                <label className="text-xs uppercase tracking-[0.16em]">
                  Tour
                  <input name="starts" type="datetime-local" className="plan-field" />
                </label>
                <button type="submit" className="lux-cta-ghost !min-h-10">Schedule tour</button>
              </form>
              <form
                className="mt-4 grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  const form = new FormData(event.currentTarget)
                  const starts = String(form.get('starts_on') || '')
                  const ends = String(form.get('ends_on') || starts)
                  if (!starts) return
                  void run(
                    () => createVenueBooking(selected.id, selected.venue_id, starts, ends),
                    () => setLeads((current) => current.map((lead) => lead.id === selected.id ? {
                      ...lead,
                      stage: 'booked',
                      bookings: [...lead.bookings, { id: crypto.randomUUID(), starts_on: starts, ends_on: ends, status: 'hold', venue_id: lead.venue_id }],
                    } : lead)),
                  )
                }}
              >
                <label className="text-xs uppercase tracking-[0.16em]">
                  Booking start
                  <input name="starts_on" type="date" className="plan-field" />
                </label>
                <label className="text-xs uppercase tracking-[0.16em]">
                  Booking end
                  <input name="ends_on" type="date" className="plan-field" />
                </label>
                <button type="submit" className="lux-cta-ghost !min-h-10">Hold the date</button>
              </form>
            </aside>
          </>)}</Presence>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="border border-[var(--dashboard-border)] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-3xl">{month.label}</h2>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Previous month" className="min-h-10 min-w-10 border border-[var(--dashboard-border)] text-sm" onClick={() => setMonthOffset((value) => value - 1)}>‹</button>
                <button type="button" aria-label="Next month" className="min-h-10 min-w-10 border border-[var(--dashboard-border)] text-sm" onClick={() => setMonthOffset((value) => value + 1)}>›</button>
              </div>
            </div>
            {VENUE_LISTINGS.length > 1 && (
              <label className="mt-3 block text-xs uppercase tracking-[0.16em]">
                Show room
                <select className="plan-field" value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
                  {VENUE_LISTINGS.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
                </select>
              </label>
            )}
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--dashboard-text-muted)]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day}>{day}</div>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {month.cells.map((cell, index) => {
                const marks = days.filter((day) => day.day === cell && resolveVenueId(day.venue_id) === roomFilter)
                const leadMarks = cell ? bookings.filter((booking) => resolveVenueId(booking.venue_id) === roomFilter && booking.status !== 'released' && booking.status !== 'cancelled' && booking.starts_on <= cell && cell <= booking.ends_on) : []
                return (
                  <div key={`${cell}-${index}`} className="min-h-16 border border-[var(--dashboard-border)] p-1 text-left text-xs">
                    <span>{cell ? Number(cell.slice(-2)) : ''}</span>
                    {marks.map((mark) => (
                      <span key={mark.id} className="mt-1 block truncate text-xs font-medium">{mark.status === 'closed' ? 'blocked' : mark.status}</span>
                    ))}
                    {leadMarks.map((mark) => (
                      <span key={mark.id} className="mt-1 block truncate text-xs text-[var(--dashboard-accent-gold)]">{mark.status === 'hold' ? 'lead hold' : 'booked'}</span>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
          <form
            className="border border-[var(--dashboard-border)] bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault()
              const form = new FormData(event.currentTarget)
              const venueId = String(form.get('venue_id') || '')
              const day = String(form.get('day') || '')
              const status = String(form.get('status') || 'open')
              if (!venueId || !day) return
              void run(
                () => setVenueAvailability(venueId, day, status),
                () => setDays((current) => {
                  const next = current.filter((item) => !(item.venue_id === venueId && item.day === day))
                  return [...next, { id: crypto.randomUUID(), venue_id: venueId, day, status }]
                }),
              )
            }}
          >
            <h2 className="font-serif text-2xl">Availability</h2>
            {VENUE_LISTINGS.length > 1 ? (
              <label className="mt-3 block text-xs uppercase tracking-[0.16em]">
                Room
                <select name="venue_id" className="plan-field" value={roomFilter} onChange={(event) => setRoomFilter(event.target.value)}>
                  {VENUE_LISTINGS.map((venue) => <option key={venue.id} value={venue.id}>{venue.name}</option>)}
                </select>
              </label>
            ) : (
              <input type="hidden" name="venue_id" value={roomFilter} />
            )}
            <label className="mt-3 block text-xs uppercase tracking-[0.16em]">
              Day
              <input name="day" type="date" className="plan-field" />
            </label>
            <label className="mt-3 block text-xs uppercase tracking-[0.16em]">
              Status
              <select name="status" className="plan-field">
                <option value="open">Open (clear a block)</option>
                <option value="hold">Hold</option>
                <option value="booked">Booked</option>
                <option value="closed">Blocked</option>
              </select>
            </label>
            <button type="submit" className="lux-cta mt-4 !min-h-10">Save day</button>
            <p className="mt-3 text-xs text-[var(--dashboard-text-muted)]">The public venue page shows only Open, On hold, or Booked for each date. Lead holds and confirmed bookings show there automatically; setting Open never hides them.</p>
          </form>
        </div>
      )}
    </div>
  )
}

function buildMonth(anchor: Date) {
  const year = anchor.getFullYear()
  const monthIndex = anchor.getMonth()
  const first = new Date(year, monthIndex, 1)
  const start = first.getDay()
  const count = new Date(year, monthIndex + 1, 0).getDate()
  const cells: string[] = []
  for (let i = 0; i < start; i += 1) cells.push('')
  for (let day = 1; day <= count; day += 1) {
    cells.push(`${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
  }
  return { label: first.toLocaleString('en-US', { month: 'long', year: 'numeric' }), cells }
}
