'use client'

import { useState, type ReactNode } from 'react'
import { Presence } from '@/components/motion/presence'
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

  const openTasks = hub.tasks.filter((task) => task.status !== 'completed')
  const doneTasks = hub.tasks.filter((task) => task.status === 'completed')
  const needsSignature = Boolean(hub.contract && hub.contract.status !== 'signed')
  const nextPayment = hub.payments.find((payment) => payment.status === 'due')
  const needsYou = needsSignature || openTasks.length > 0 || Boolean(nextPayment)

  return (
    <div className="hub mx-auto max-w-5xl">
      <header className="pb-6">
        <p className="text-sm text-[var(--dashboard-text-muted)]">
          <span className="font-medium text-[var(--dashboard-text)]">{stage}</span> · with {hub.coordinator}
        </p>
        <h1 className="mt-1 font-serif text-[2.6rem] leading-[1.02] tracking-[-0.02em] md:text-6xl">{hub.contact?.name || 'Your event'}</h1>
        <dl className="mt-5 grid grid-cols-3 border-y border-[var(--dashboard-border)] text-sm">
          <Fact label="Date" value={hub.lead.event_date || 'Open'} />
          <Fact label="Guests" value={String(hub.lead.guest_count || '—')} />
          <Fact label="Total" value={hub.totalCents ? formatCurrency(hub.totalCents) : '—'} />
        </dl>
        <p className="mt-3 text-sm text-[var(--dashboard-text-muted)]">{hub.lead.event_type}{hub.venue?.name ? ` at ${hub.venue.name}` : ''}</p>
      </header>

      <Presence show={Boolean(message)} id={message}>
        <p role="status" className="mb-6 border-l border-[var(--theme-accent-text)] bg-white px-4 py-3 text-sm">{message}</p>
      </Presence>

      <div className="grid gap-x-12 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div>
          <Section title={needsYou ? 'Waiting on you' : 'All caught up'} lead>
            {!needsYou && <p className="text-sm text-[var(--dashboard-text-muted)]">Nothing needs you right now. {hub.coordinator} will post here when it does.</p>}
            <Presence show={needsSignature}>{needsSignature && (
              <form className="space-y-3 border-b border-[var(--dashboard-border)] pb-5" onSubmit={(event) => { event.preventDefault(); void commit({ type: 'sign', name: signature }) }}>
                <p className="font-medium">Sign your contract</p>
                <label className="hub-label">
                  Your full name
                  <input className="plan-field" value={signature} onChange={(event) => setSignature(event.target.value)} autoComplete="name" />
                </label>
                <button type="submit" className="lux-cta w-full sm:w-auto">Sign the contract</button>
              </form>
            )}</Presence>
            {nextPayment && (
              <div className="flex items-baseline justify-between gap-3 border-b border-[var(--dashboard-border)] py-4 text-sm">
                <span><span className="font-medium capitalize">{nextPayment.kind}</span>{nextPayment.due_on ? <span className="text-[var(--dashboard-text-muted)]"> · due {nextPayment.due_on}</span> : null}</span>
                <span className="tabular-nums font-medium">{formatCurrency(nextPayment.amount_cents)}</span>
              </div>
            )}
            {openTasks.length > 0 && (
              <ul>
                {openTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 border-b border-[var(--dashboard-border)] py-3">
                    <span className="min-w-0">
                      <span className="block font-medium">{task.title}</span>
                      {task.due_on && <span className="text-xs text-[var(--dashboard-text-muted)]">Due {task.due_on}</span>}
                    </span>
                    <button type="button" className="hub-chip" onClick={() => void commit({ type: 'complete_task', taskId: task.id })}>Mark done</button>
                  </li>
                ))}
              </ul>
            )}
            {doneTasks.length > 0 && <p className="pt-3 text-xs text-[var(--dashboard-text-muted)]">{doneTasks.length} done: {doneTasks.map((task) => task.title).join(', ')}</p>}
            <p className="pt-3 text-xs text-[var(--dashboard-text-muted)]">Your checklist is shared with {hub.coordinator}. Their private prep stays off this page.</p>
          </Section>

          <Section title="Event day">
            <ol>
              {hub.schedule.map((cue) => (
                <li key={cue.id} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 border-b border-[var(--dashboard-border)] py-3 text-sm last:border-0">
                  <span className="tabular-nums font-medium">{cue.starts_at}</span>
                  <span><span className="font-medium">{cue.title}</span>{cue.notes ? <span className="mt-0.5 block text-[var(--dashboard-text-muted)]">{cue.notes}</span> : null}</span>
                </li>
              ))}
              {hub.schedule.length === 0 && <p className="text-sm text-[var(--dashboard-text-muted)]">The run of show is still being written.</p>}
            </ol>
          </Section>

          <Section title={`Messages with ${hub.coordinator}`}>
            <ol className="space-y-4">
              {hub.messages.map((item) => (
                <li key={item.id} className="text-sm">
                  <p className="text-xs font-medium text-[var(--dashboard-text-muted)]">{item.author_name}</p>
                  <p className="mt-1 max-w-[60ch]">{item.body}</p>
                </li>
              ))}
            </ol>
            <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); void commit({ type: 'message', body: note }); setNote('') }}>
              <label className="sr-only" htmlFor="hub-note">Message</label>
              <textarea id="hub-note" className="plan-field min-h-24" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write to your coordinator" />
              <button type="submit" className="lux-cta w-full sm:w-auto">Send</button>
            </form>
          </Section>

          <Section title="Timeline">
            <ol>
              {hub.timeline.map((item) => (
                <li key={item.id} className="border-b border-[var(--dashboard-border)] py-3 text-sm last:border-0">
                  <p className="text-xs text-[var(--dashboard-text-muted)]"><span className="capitalize">{item.kind}</span> · {item.author_name}</p>
                  <p className="mt-1">{item.body}</p>
                </li>
              ))}
              {hub.timeline.length === 0 && <p className="text-sm text-[var(--dashboard-text-muted)]">Your coordinator will post updates here.</p>}
            </ol>
          </Section>
        </div>

        <aside>
          <Section title="Venue">
            <h3 className="font-serif text-2xl">{hub.venue?.name || hub.lead.venue_name || 'Venue to be chosen'}</h3>
            {hub.venue && <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{[hub.venue.neighborhood, hub.venue.city].filter(Boolean).join(' · ')}{hub.venue.capacity ? ` · up to ${hub.venue.capacity}` : ''}</p>}
            {hub.venue?.description && <p className="mt-3 text-sm">{hub.venue.description}</p>}
            {hub.venue && hub.venue.amenities.length > 0 && <p className="mt-2 text-sm text-[var(--dashboard-text-muted)]">{hub.venue.amenities.join(' · ')}</p>}
            <Presence show={Boolean(hub.layout)}>{hub.layout && (
              <div className="mt-4 border-t border-[var(--dashboard-border)] pt-3">
                <p className="text-xs font-medium text-[var(--dashboard-text-muted)]">{hub.layout.floor_plan_label}</p>
                <p className="mt-1 text-sm">{hub.layout.body}</p>
              </div>
            )}</Presence>
          </Section>

          <Section title="Rentals and services">
            <ul className="text-sm">
              {hub.lines.map((line) => (
                <li key={line.id} className="flex justify-between gap-3 border-b border-[var(--dashboard-border)] py-2">
                  <span>{line.name} <span className="text-[var(--dashboard-text-muted)]">× {line.quantity}</span></span>
                  <span className="tabular-nums">{formatCurrency(line.quantity * line.unit_cents)}</span>
                </li>
              ))}
              {hub.lines.length === 0 && <li className="text-[var(--dashboard-text-muted)]">Nothing has been selected yet.</li>}
            </ul>
            {hub.proposalTitle && (
              <p className="mt-3 flex justify-between gap-3 text-sm font-medium"><span>{hub.proposalTitle}</span><span className="tabular-nums">{formatCurrency(hub.totalCents)}</span></p>
            )}
          </Section>

          <Section title="Contract and payments">
            <p className="text-sm">{hub.contract ? <>Contract <span className="font-medium capitalize">{hub.contract.status}</span>{hub.contract.status === 'signed' && hub.contract.signed_at ? ` on ${hub.contract.signed_at.slice(0, 10)}` : ''}</> : 'Your contract is not ready yet.'}</p>
            <ul className="mt-2 text-sm">
              {hub.payments.map((payment) => (
                <li key={payment.id} className="flex justify-between gap-3 border-b border-[var(--dashboard-border)] py-2">
                  <span className="capitalize">{payment.kind} <span className="text-[var(--dashboard-text-muted)]">· {payment.status}{payment.due_on ? ` · ${payment.due_on}` : ''}</span></span>
                  <span className="tabular-nums">{formatCurrency(payment.amount_cents)}</span>
                </li>
              ))}
              {hub.payments.length === 0 && <li className="text-[var(--dashboard-text-muted)]">No invoice yet.</li>}
            </ul>
          </Section>

          <Section title="Guest details">
            <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void commit({ type: 'details', guest_count: Number(guests), details }) }}>
              <label className="hub-label">
                Guest count
                <input className="plan-field" inputMode="numeric" value={guests} onChange={(event) => setGuests(event.target.value)} />
              </label>
              <label className="hub-label">
                What changed
                <textarea className="plan-field min-h-20" value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Timing, meal counts, accessibility" />
              </label>
              <button type="submit" className="lux-cta-ghost w-full">Update your coordinator</button>
            </form>
          </Section>

          <Section title="Documents">
            <ul className="text-sm">
              {hub.documents.map((file) => (
                <li key={file.id} className="border-b border-[var(--dashboard-border)] py-2">{file.name} <span className="text-[var(--dashboard-text-muted)]">· {file.kind}</span></li>
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
              <label className="hub-label">
                Kind
                <select className="plan-field" value={docKind} onChange={(event) => setDocKind(event.target.value as typeof docKind)}>
                  <option value="inspiration">Inspiration</option>
                  <option value="vendor">Vendor contract</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <input name="file" type="file" aria-label="File" className="block w-full text-sm file:mr-3 file:border file:border-[var(--dashboard-border)] file:bg-white file:px-3 file:py-2 file:text-xs" />
              <button type="submit" className="lux-cta-ghost w-full">Upload</button>
            </form>
          </Section>

          <Section title="Upcoming">
            <ul className="text-sm">
              {hub.meetings.map((item) => (
                <li key={item.id} className="border-b border-[var(--dashboard-border)] py-2"><span className="tabular-nums">{item.when}</span> · {item.label} · {item.place}</li>
              ))}
              {hub.meetings.length === 0 && <li className="text-[var(--dashboard-text-muted)]">No tour or meeting is on the calendar.</li>}
            </ul>
          </Section>
        </aside>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[var(--dashboard-border)] py-3 pr-3 last:border-0 [&:not(:first-child)]:pl-3">
      <dt className="text-xs text-[var(--dashboard-text-muted)]">{label}</dt>
      <dd className="mt-0.5 truncate font-medium tabular-nums">{value}</dd>
    </div>
  )
}

function Section({ title, children, lead = false }: { title: string; children: ReactNode; lead?: boolean }) {
  return (
    <section className={lead ? 'mb-10 border border-[var(--dashboard-border)] bg-white p-5' : 'mb-10'}>
      <h2 className="font-serif text-[1.65rem] leading-tight">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}
