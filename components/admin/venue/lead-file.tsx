'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { PIPELINE_STAGES, contactName, leadCartStatus, proposalTotal, type DeskWorkspace, type PipelineStage, type ProposalLine } from '@/lib/venues/desk'
import { useDesk } from '@/components/admin/venue/use-desk'

export function LeadFile({
  initial,
  leadId,
  backHref,
  live = false,
}: {
  initial: DeskWorkspace
  leadId: string
  backHref: string
  live?: boolean
}) {
  const api = useDesk(initial, live)
  const lead = api.desk.leads.find((item) => item.id === leadId)
  const [note, setNote] = useState('')
  const [kind, setKind] = useState<'note' | 'call' | 'email'>('note')
  const [tourAt, setTourAt] = useState('')
  const [holdStart, setHoldStart] = useState('')
  const [holdEnd, setHoldEnd] = useState('')
  const [reminderOn, setReminderOn] = useState('')
  const [reminderBody, setReminderBody] = useState('')
  const [comment, setComment] = useState('')
  const [commentTask, setCommentTask] = useState('')

  if (!lead) {
    return <p className="font-serif text-3xl">That lead is not on the desk.</p>
  }

  const contact = api.desk.contacts.find((item) => item.id === lead.contact_id)
  const company = api.desk.companies.find((item) => item.id === lead.company_id)
  const activities = api.desk.activities.filter((item) => item.lead_id === lead.id)
  const tasks = api.desk.tasks.filter((item) => item.lead_id === lead.id)
  const proposal = api.desk.proposals.find((item) => item.lead_id === lead.id)
  const contract = api.desk.contracts.find((item) => item.lead_id === lead.id)
  const payments = api.desk.payments.filter((item) => item.lead_id === lead.id)
  const reminders = api.desk.reminders.filter((item) => item.lead_id === lead.id)
  const tours = api.desk.tours.filter((item) => item.lead_id === lead.id)
  const holds = api.desk.holds.filter((item) => item.lead_id === lead.id)
  const clientNotes = api.desk.messages.filter((item) => item.lead_id === lead.id)
  const clientFiles = api.desk.documents.filter((item) => item.lead_id === lead.id)
  const layout = api.desk.layouts.find((item) => item.lead_id === lead.id)
  const cart = api.desk.carts?.find((item) => item.lead_id === lead.id)
  const cartState = leadCartStatus(api.desk, lead.id)

  const abandonDays = api.desk.abandon_days ?? 3
  const today = new Date().toISOString().slice(0, 10)

  function addLine() {
    const lines: ProposalLine[] = [...(proposal?.lines || []), { id: `line-${Date.now()}`, kind: 'service', name: 'Service', quantity: 1, unit_cents: 100_000 }]
    api.saveProposal(lead!.id, lines)
  }

  function editLine(lineId: string, patch: Partial<ProposalLine>) {
    const lines = (proposal?.lines || []).map((line) => line.id === lineId ? { ...line, ...patch } : line)
    api.saveProposal(lead!.id, lines)
  }

  function removeLine(lineId: string) {
    api.saveProposal(lead!.id, (proposal?.lines || []).filter((line) => line.id !== lineId))
  }

  return (
    <div className="space-y-6">
      <Link href={backHref} className="text-xs font-medium text-[var(--dashboard-text-muted)]">Back to the pipeline</Link>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--dashboard-border)] pb-4">
        <div>
          <p className="text-xs font-medium text-[var(--dashboard-text-muted)]">{lead.source} · {lead.owner_name}</p>
          <h1 className="font-serif text-4xl md:text-5xl">{contactName(api.desk, lead.contact_id)}</h1>
          <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{company?.name || 'Private client'} · {lead.event_type} · {lead.guest_count || '—'} guests</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl">{formatCurrency(lead.value_cents)}</p>
          <label className="mt-2 block text-xs font-medium">
            Stage
            <select className="plan-field" value={lead.stage} onChange={(event) => api.setStage(lead.id, event.target.value as PipelineStage)}>
              {PIPELINE_STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
            </select>
          </label>
        </div>
      </header>
      {api.message && <p className="text-sm text-[var(--dashboard-text-muted)]">{api.message}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-6">
          <section className="border border-[var(--dashboard-border)] bg-white p-4">
            <h2 className="font-serif text-2xl">Contact</h2>
            <p className="mt-2 text-sm">{contact?.email} · {contact?.phone}</p>
            <label className="mt-3 block text-xs font-medium">
              Owner
              <select className="plan-field" value={lead.owner_name} onChange={(event) => api.setOwner(lead.id, event.target.value)}>
                {[...new Set([...api.desk.leads.map((item) => item.owner_name), 'Mara Quinn', 'Chris Adeyemi', 'Unassigned'])].map((owner) => (
                  <option key={owner}>{owner}</option>
                ))}
              </select>
            </label>
          </section>

          <section className="border border-[var(--dashboard-border)] bg-white p-4" aria-labelledby="lead-cart">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="lead-cart" className="font-serif text-2xl">Cart</h2>
              <span className={`text-xs font-medium uppercase tracking-[0.12em] ${cartState === 'abandoned' ? 'text-[var(--destructive)]' : 'text-[var(--dashboard-text-muted)]'}`}>
                {{ none: 'No cart yet', empty: 'Empty', open: 'Open', abandoned: `Abandoned · ${abandonDays}+ days`, checked_out: 'Checked out' }[cartState]}
              </span>
            </div>
            {cart && cart.items.length > 0 ? (
              <>
                <ul className="mt-3 space-y-2 text-sm">
                  {cart.items.map((line) => (
                    <li key={line.id} className="flex justify-between gap-3 border-t border-[var(--dashboard-border)] pt-2">
                      <span>{line.name} × {line.quantity}</span>
                      <span className="tabular-nums">{formatCurrency(line.quantity * line.unit_cents)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-[var(--dashboard-border)] pt-3">
                  <p className="font-serif text-2xl tabular-nums">{formatCurrency(cart.subtotal_cents)}</p>
                  <p className="text-xs text-[var(--dashboard-text-muted)]">
                    {cart.item_count} pieces · last updated {new Date(cart.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    {cart.checked_out_at ? ` · checked out ${new Date(cart.checked_out_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--dashboard-text-muted)]">Nothing in the cart yet.</p>
            )}
            {(lead.budget_range || lead.consent) && (
              <p className="mt-3 text-xs text-[var(--dashboard-text-muted)]">
                {lead.budget_range ? `Budget ${lead.budget_range}` : ''}{lead.budget_range && lead.consent ? ' · ' : ''}{lead.consent ? 'Consented to contact' : ''}
              </p>
            )}
          </section>

          <section className="border border-[var(--dashboard-border)] bg-white p-4">
            <h2 className="font-serif text-2xl">Activity</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['note', 'call', 'email'] as const).map((item) => (
                <button key={item} type="button" onClick={() => setKind(item)} className={`min-h-9 border px-3 text-xs font-medium ${kind === item ? 'bg-[var(--theme-dark)] text-[var(--theme-on-dark)]' : ''}`}>{item}</button>
              ))}
            </div>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} className="plan-field mt-3 min-h-20" placeholder="What happened" />
            <button type="button" className="lux-cta mt-3 !min-h-10" onClick={() => { api.logActivity(lead.id, kind, note); setNote('') }}>Log</button>
            <ol className="mt-4 space-y-3">
              {activities.map((activity) => (
                <li key={activity.id} className="border-t border-[var(--dashboard-border)] pt-3 text-sm">
                  <p className="text-xs font-medium text-[var(--dashboard-text-muted)]">{activity.kind} · {activity.author_name}</p>
                  <p className="mt-1">{activity.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="border border-[var(--dashboard-border)] bg-white p-4">
            <h2 className="font-serif text-2xl">From the client</h2>
            <p className="mt-2 text-sm text-[var(--dashboard-text-muted)]">{layout ? layout.floor_plan_label : 'No floor plan yet'}{layout?.body ? ` · ${layout.body}` : ''}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {clientFiles.map((file) => <li key={file.id}>{file.kind} · {file.name}</li>)}
              {clientFiles.length === 0 && <li className="text-[var(--dashboard-text-muted)]">No documents yet.</li>}
            </ul>
            <ul className="mt-3 space-y-2 text-sm">
              {clientNotes.map((item) => <li key={item.id}><span className="uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">{item.author_name}</span> · {item.body}</li>)}
            </ul>
          </section>

          <section className="border border-[var(--dashboard-border)] bg-white p-4">
            <h2 className="font-serif text-2xl">Proposal</h2>
            {proposal && <p className="mt-1 text-sm text-[var(--dashboard-text-muted)]">{proposal.title}</p>}
            <ul className="mt-3 space-y-2 text-sm">
              {(proposal?.lines || []).map((line) => (
                <li key={line.id} className="grid grid-cols-[minmax(0,1fr)_4rem_6rem] items-end gap-2 border-t border-[var(--dashboard-border)] pt-2">
                  <label className="text-xs font-medium">
                    {line.kind === 'rental' ? 'Rental' : 'Service'}
                    <input className="plan-field !mt-1" defaultValue={line.name} onBlur={(event) => event.target.value !== line.name && editLine(line.id, { name: event.target.value })} />
                  </label>
                  <label className="text-xs font-medium">
                    Qty
                    <input type="number" min={1} inputMode="numeric" className="plan-field !mt-1" defaultValue={line.quantity} onBlur={(event) => Number(event.target.value) !== line.quantity && editLine(line.id, { quantity: Math.max(1, Math.round(Number(event.target.value) || 1)) })} />
                  </label>
                  <label className="text-xs font-medium">
                    Each ($)
                    <input type="number" min={0} step="0.01" inputMode="decimal" className="plan-field !mt-1" defaultValue={(line.unit_cents / 100).toFixed(2)} onBlur={(event) => Math.round(Number(event.target.value) * 100) !== line.unit_cents && editLine(line.id, { unit_cents: Math.max(0, Math.round((Number(event.target.value) || 0) * 100)) })} />
                  </label>
                  <span className="col-span-2 text-xs tabular-nums text-[var(--dashboard-text-muted)]">{formatCurrency(line.quantity * line.unit_cents)}</span>
                  <button type="button" className="justify-self-end text-xs font-medium underline" onClick={() => removeLine(line.id)}>Remove</button>
                </li>
              ))}
            </ul>
            {proposal && <p className="mt-3 font-serif text-2xl">{formatCurrency(proposalTotal(proposal))} · {proposal.status}</p>}
            <button type="button" className="lux-cta-ghost mt-3 !min-h-10" onClick={addLine}>Add a line</button>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="border border-[var(--dashboard-border)] bg-white p-4">
              <h2 className="font-serif text-2xl">Contract</h2>
              <p className="mt-2 text-sm">{contract ? contract.status : 'No contract yet'}</p>
              <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">Records the status only. Nothing is sent to the client.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(['draft', 'sent', 'signed'] as const).map((status) => (
                  <button key={status} type="button" className="min-h-9 border px-3 text-xs font-medium" onClick={() => api.setContract(lead.id, status)}>{status}</button>
                ))}
              </div>
            </article>
            <article className="border border-[var(--dashboard-border)] bg-white p-4">
              <h2 className="font-serif text-2xl">Payments</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {payments.map((payment) => (
                  <li key={payment.id}>{payment.kind} · {formatCurrency(payment.amount_cents)} · {payment.status}</li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">Records the status only. No card is charged.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="lux-cta !min-h-10" onClick={() => api.setPayment(lead.id, 'paid')}>Mark deposit paid</button>
                <button type="button" className="min-h-10 border px-3 text-xs font-medium" onClick={() => api.setPayment(lead.id, 'due')}>Due</button>
                <button type="button" className="min-h-10 border px-3 text-xs font-medium" onClick={() => api.setPayment(lead.id, 'waived')}>Waived</button>
              </div>
            </article>
          </section>

          <section className="border border-[var(--dashboard-border)] bg-white p-4">
            <h2 className="font-serif text-2xl">Calendar</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {tours.map((tour) => <li key={tour.id}>Tour {tour.starts_at.replace('T', ' ').slice(0, 16)} · {tour.venue_name}</li>)}
              {holds.map((hold) => <li key={hold.id}>Hold {hold.starts_on} – {hold.ends_on} · {hold.status}</li>)}
            </ul>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-medium">Tour<input type="datetime-local" className="plan-field" value={tourAt} onChange={(event) => setTourAt(event.target.value)} /></label>
              <button type="button" className="lux-cta-ghost self-end !min-h-10" onClick={() => api.scheduleTour(lead.id, tourAt)}>Schedule tour</button>
              <label className="text-xs font-medium">Hold start<input type="date" className="plan-field" value={holdStart} onChange={(event) => setHoldStart(event.target.value)} /></label>
              <label className="text-xs font-medium">Hold end<input type="date" className="plan-field" value={holdEnd} onChange={(event) => setHoldEnd(event.target.value)} /></label>
            </div>
            <button type="button" className="lux-cta mt-3 !min-h-10" onClick={() => api.holdDate(lead.id, holdStart, holdEnd)}>Hold the date</button>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="border border-[var(--dashboard-border)] bg-white p-4">
            <h2 className="font-serif text-2xl">Tasks</h2>
            <ul className="mt-3 space-y-4">
              {tasks.map((task) => (
                <li key={task.id} className="border-t border-[var(--dashboard-border)] pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">{task.audience === 'client' ? 'Shared with client · ' : ''}{task.priority} · {task.assignee_name} · {task.due_on || 'No date'} · {task.status}</p>
                    </div>
                    {task.status !== 'completed' && (
                      <button type="button" className="text-xs font-medium underline" onClick={() => api.markTask(task.id, 'completed')}>Done</button>
                    )}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {task.checklist.map((item) => (
                      <li key={item.id}>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={item.done} onChange={() => api.toggleCheck(task.id, item.id)} />
                          {item.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                  {task.comments.map((item) => <p key={item.id} className="mt-2 text-sm text-[var(--dashboard-text-muted)]">{item.author_name}: {item.body}</p>)}
                  <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); api.addComment(task.id, commentTask === task.id ? comment : ''); setComment('') }}>
                    <input value={commentTask === task.id ? comment : ''} onFocus={() => setCommentTask(task.id)} onChange={(event) => { setCommentTask(task.id); setComment(event.target.value) }} placeholder="Comment" className="plan-field" />
                    <button type="submit" className="text-xs font-medium">Add</button>
                  </form>
                </li>
              ))}
              {tasks.length === 0 && <p className="text-sm text-[var(--dashboard-text-muted)]">No tasks yet. Moving the stage to Tour or Booked creates them from the templates.</p>}
            </ul>
          </section>

          <section className="border border-[var(--dashboard-border)] bg-white p-4">
            <h2 className="font-serif text-2xl">Follow-ups</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {reminders.map((reminder) => (
                <li key={reminder.id}>
                  <label className={`flex items-start gap-2 ${reminder.done ? 'text-[var(--dashboard-text-muted)] line-through' : ''}`}>
                    <input type="checkbox" className="mt-1" checked={reminder.done} onChange={() => api.setReminderDone(reminder.id, !reminder.done)} />
                    <span>
                      <span className={`tabular-nums ${!reminder.done && reminder.due_on <= today ? 'font-medium text-[var(--destructive)]' : ''}`}>{reminder.due_on}</span> · {reminder.body}
                      <span className="block text-xs text-[var(--dashboard-text-muted)]">{reminder.owner_name}</span>
                    </span>
                  </label>
                </li>
              ))}
              {reminders.length === 0 && <li className="text-[var(--dashboard-text-muted)]">No follow-ups yet.</li>}
            </ul>
            <p className="mt-2 text-xs text-[var(--dashboard-text-muted)]">Reminders show here and on the pipeline. Nothing is emailed or texted.</p>
            <label className="mt-3 block text-xs font-medium">Due<input type="date" className="plan-field" value={reminderOn} onChange={(event) => setReminderOn(event.target.value)} /></label>
            <input value={reminderBody} onChange={(event) => setReminderBody(event.target.value)} placeholder="What to remember" className="plan-field" />
            <button type="button" className="lux-cta-ghost mt-3 !min-h-10" onClick={() => { api.addReminder(lead.id, reminderOn, reminderBody); setReminderBody('') }}>Set reminder</button>
          </section>
        </aside>
      </div>
    </div>
  )
}
