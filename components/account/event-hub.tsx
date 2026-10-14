'use client'

import { useState, type ReactNode } from 'react'
import { formatCurrency } from '@/lib/utils'
import { PIPELINE_STAGES, applyClientChange, deskFromHub, toClientHub, type ClientChange, type ClientHub } from '@/lib/venues/desk'
import { persistClientChange } from '@/app/account/event/actions'

export function EventHub({ initial, live = false }: { initial: ClientHub; live?: boolean }) {
  const [hub, setHub] = useState(initial)
  const [message, setMessage] = useState('')
  const [guests, setGuests] = useState(String(initial.lead.guest_count || ''))
  const [details, setDetails] = useState('')
  const [note, setNote] = useState('')
  const [signature, setSignature] = useState(initial.contact?.name || '')
  const [docKind, setDocKind] = useState<'vendor' | 'inspiration' | 'other'>('inspiration')
  const stage = PIPELINE_STAGES.find((item) => item.id === hub.lead.stage)?.label || hub.lead.stage

  async function commit(change: ClientChange) {
    const base = deskFromHub(hub)
    const nextDesk = applyClientChange(base, hub.lead.id, change)
    if (nextDesk === base) return
    const next = toClientHub(nextDesk, hub.lead.id)
    if (!next) return
    setHub(next)
    setMessage(`Sent to ${hub.coordinator}. It is on your timeline, and a staff task was opened.`)
    if (!live) return
    try {
      await persistClientChange(hub.lead.id, change)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Saved on this screen only.')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <header className="border-b border-[var(--dashboard-border)] pb-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--dashboard-text-muted)]">{stage} · {hub.coordinator}</p>
        <h1 className="mt-1 font-serif text-4xl">{hub.contact?.name || 'Your event'}</h1>
        <p className="mt-2 text-sm text-[var(--dashboard-text-muted)]">
          {hub.lead.event_type} · {hub.lead.event_date || 'Date open'} · {hub.lead.guest_count || '—'} guests
        </p>
      </header>
      {message && <p className="text-sm text-[var(--dashboard-text-muted)]">{message}</p>}

      <Section title="Timeline">
        <ol className="space-y-3">
          {hub.timeline.map((item) => (
            <li key={item.id} className="border-t border-[var(--dashboard-border)] pt-3 text-sm">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">{item.kind} · {item.author_name}</p>
              <p className="mt-1">{item.body}</p>
            </li>
          ))}
          {hub.timeline.length === 0 && <p className="text-sm text-[var(--dashboard-text-muted)]">Your coordinator will post updates here.</p>}
        </ol>
      </Section>

      <Section title="Event day">
        <ol className="space-y-3">
          {hub.schedule.map((cue) => (
            <li key={cue.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 text-sm">
              <span className="font-medium">{cue.starts_at}</span>
              <span><span className="font-medium">{cue.title}</span>{cue.notes ? <span className="mt-1 block text-[var(--dashboard-text-muted)]">{cue.notes}</span> : null}</span>
            </li>
          ))}
          {hub.schedule.length === 0 && <p className="text-sm text-[var(--dashboard-text-muted)]">The run of show is still being written.</p>}
        </ol>
      </Section>

      <Section title="Venue">
        <h3 className="font-serif text-2xl">{hub.venue?.name || hub.lead.venue_name || 'Venue to be chosen'}</h3>
        {hub.venue && <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{[hub.venue.neighborhood, hub.venue.city].filter(Boolean).join(' · ')}{hub.venue.capacity ? ` · up to ${hub.venue.capacity}` : ''}</p>}
        {hub.venue?.description && <p className="mt-3 text-sm">{hub.venue.description}</p>}
        {hub.venue && hub.venue.amenities.length > 0 && <p className="mt-2 text-sm text-[var(--dashboard-text-muted)]">{hub.venue.amenities.join(' · ')}</p>}
        {hub.layout && (
          <div className="mt-4 border-t border-[var(--dashboard-border)] pt-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">{hub.layout.floor_plan_label}</p>
            <p className="mt-1 text-sm">{hub.layout.body}</p>
          </div>
        )}
      </Section>

      <Section title="Rentals and services">
        <ul className="space-y-2 text-sm">
          {hub.lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-3 border-t border-[var(--dashboard-border)] pt-2">
              <span>{line.kind === 'rental' ? 'Rental' : 'Service'} · {line.name} × {line.quantity}</span>
              <span>{formatCurrency(line.quantity * line.unit_cents)}</span>
            </li>
          ))}
          {hub.lines.length === 0 && <li className="text-[var(--dashboard-text-muted)]">Nothing has been selected yet.</li>}
        </ul>
        {hub.proposalTitle && <p className="mt-3 font-serif text-2xl">{hub.proposalTitle} · {formatCurrency(hub.totalCents)}</p>}
      </Section>

      <Section title="Contract">
        <p className="text-sm">{hub.contract ? `Status · ${hub.contract.status}` : 'Your contract is not ready yet.'}</p>
        {hub.contract?.status === 'signed' && <p className="mt-2 text-sm text-[var(--dashboard-text-muted)]">Signed {hub.contract.signed_at?.slice(0, 10)}.</p>}
        {hub.contract && hub.contract.status !== 'signed' && (
          <form className="mt-3 space-y-3" onSubmit={(event) => { event.preventDefault(); void commit({ type: 'sign', name: signature }) }}>
            <label className="block text-[10px] uppercase tracking-[0.14em]">
              Sign with your name
              <input className="plan-field" value={signature} onChange={(event) => setSignature(event.target.value)} autoComplete="name" />
            </label>
            <button type="submit" className="lux-cta w-full">Sign the contract</button>
          </form>
        )}
      </Section>

      <Section title="Payments">
        <ul className="space-y-2 text-sm">
          {hub.payments.map((payment) => (
            <li key={payment.id} className="flex justify-between gap-3 border-t border-[var(--dashboard-border)] pt-2">
              <span className="uppercase tracking-[0.12em]">{payment.kind}</span>
              <span>{formatCurrency(payment.amount_cents)} · {payment.status}{payment.due_on ? ` · ${payment.due_on}` : ''}</span>
            </li>
          ))}
          {hub.payments.length === 0 && <li className="text-[var(--dashboard-text-muted)]">No invoice yet.</li>}
        </ul>
      </Section>

      <Section title="Your checklist">
        <p className="text-sm text-[var(--dashboard-text-muted)]">Shared with {hub.coordinator}. Their private prep stays off this page.</p>
        <ul className="mt-3 space-y-3">
          {hub.tasks.map((task) => (
            <li key={task.id} className="border-t border-[var(--dashboard-border)] pt-3">
              <p className="font-medium">{task.title}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">{task.status}{task.due_on ? ` · ${task.due_on}` : ''}</p>
              {task.status !== 'completed' && (
                <button type="button" className="lux-cta mt-3 w-full" onClick={() => void commit({ type: 'complete_task', taskId: task.id })}>Mark done</button>
              )}
            </li>
          ))}
          {hub.tasks.length === 0 && <li className="text-sm text-[var(--dashboard-text-muted)]">Nothing is waiting on you.</li>}
        </ul>
      </Section>

      <Section title="Documents">
        <ul className="space-y-2 text-sm">
          {hub.documents.map((file) => (
            <li key={file.id} className="border-t border-[var(--dashboard-border)] pt-2">{file.kind} · {file.name}</li>
          ))}
        </ul>
        <form className="mt-3 space-y-3" onSubmit={(event) => {
          event.preventDefault()
          const input = event.currentTarget.elements.namedItem('file') as HTMLInputElement
          const file = input.files?.[0]
          if (!file) return
          void commit({ type: 'document', name: file.name, kind: docKind })
          input.value = ''
        }}>
          <label className="block text-[10px] uppercase tracking-[0.14em]">
            Kind
            <select className="plan-field" value={docKind} onChange={(event) => setDocKind(event.target.value as typeof docKind)}>
              <option value="inspiration">Inspiration</option>
              <option value="vendor">Vendor contract</option>
              <option value="other">Other</option>
            </select>
          </label>
          <input name="file" type="file" className="block w-full text-sm" />
          <button type="submit" className="lux-cta-ghost w-full">Upload</button>
        </form>
      </Section>

      <Section title="Guest details">
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void commit({ type: 'details', guest_count: Number(guests), details }) }}>
          <label className="block text-[10px] uppercase tracking-[0.14em]">
            Guest count
            <input className="plan-field" inputMode="numeric" value={guests} onChange={(event) => setGuests(event.target.value)} />
          </label>
          <label className="block text-[10px] uppercase tracking-[0.14em]">
            What changed
            <textarea className="plan-field min-h-24" value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Timing, meal counts, accessibility" />
          </label>
          <button type="submit" className="lux-cta w-full">Update your coordinator</button>
        </form>
      </Section>

      <Section title={`Messages with ${hub.coordinator}`}>
        <ol className="space-y-3">
          {hub.messages.map((item) => (
            <li key={item.id} className="border-t border-[var(--dashboard-border)] pt-3 text-sm">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">{item.author_name}</p>
              <p className="mt-1">{item.body}</p>
            </li>
          ))}
        </ol>
        <form className="mt-3 space-y-3" onSubmit={(event) => { event.preventDefault(); void commit({ type: 'message', body: note }); setNote('') }}>
          <textarea className="plan-field min-h-24" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write to your coordinator" />
          <button type="submit" className="lux-cta w-full">Send</button>
        </form>
      </Section>

      <Section title="Upcoming">
        <ul className="space-y-2 text-sm">
          {hub.meetings.map((item) => (
            <li key={item.id} className="border-t border-[var(--dashboard-border)] pt-2">{item.when} · {item.label} · {item.place}</li>
          ))}
          {hub.meetings.length === 0 && <li className="text-[var(--dashboard-text-muted)]">No tour or meeting is on the calendar.</li>}
        </ul>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-[var(--dashboard-border)] bg-white p-4">
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}
