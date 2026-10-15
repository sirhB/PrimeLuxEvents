import type { DeskWorkspace } from '@/lib/venues/desk'
import type { DigestInput } from './digest'
import type { ActivityEntry } from './activity'
import type { VoiceSnapshot } from './voice'

export function digestFromDesk(desk: DeskWorkspace, now = new Date(), activity: ActivityEntry[] = []): DigestInput {
  const contacts = new Map(desk.contacts.map((contact) => [contact.id, contact.name]))
  const leadName = (leadId: string | null) => {
    const lead = desk.leads.find((item) => item.id === leadId)
    return lead ? contacts.get(lead.contact_id) || lead.venue_name || 'Lead' : 'Lead'
  }
  const stageMoves = [
    ...desk.activities
      .filter((item) => item.kind === 'stage')
      .map((item) => ({ name: leadName(item.lead_id), from: 'previous', to: item.body, at: item.created_at })),
    ...activity
      .filter((item) => item.action === 'leads.stage' && item.before && item.after)
      .map((item) => ({
        name: leadName(item.recordId),
        from: String(item.before?.stage || 'previous'),
        to: String(item.after?.stage || 'next'),
        at: item.createdAt,
      })),
  ]
  return {
    now: now.toISOString(),
    timezone: 'America/New_York',
    leads: desk.leads.map((lead) => ({
      name: contacts.get(lead.contact_id) || 'Lead',
      stage: lead.stage,
      createdAt: lead.stage === 'inquiry' ? now.toISOString() : '2020-01-01T00:00:00.000Z',
    })),
    stageMoves,
    tours: desk.tours.map((tour) => ({ name: leadName(tour.lead_id), venue: tour.venue_name, startsAt: tour.starts_at })),
    events: desk.leads
      .filter((lead) => lead.event_date && lead.stage !== 'lost')
      .map((lead) => ({
        name: contacts.get(lead.contact_id) || 'Lead',
        venue: lead.venue_name || 'Venue to be chosen',
        eventDate: lead.event_date || '',
      })),
    deposits: desk.payments.map((payment) => ({
      name: leadName(payment.lead_id),
      status: payment.status,
      amountCents: payment.amount_cents,
      dueOn: payment.due_on,
    })),
    tasks: desk.tasks
      .filter((task) => task.audience === 'staff')
      .map((task) => ({ title: task.title, assignee: task.assignee_name, dueOn: task.due_on, status: task.status })),
    clientActivity: desk.activities
      .filter((item) => item.visibility === 'client' || item.kind === 'client')
      .map((item) => ({ name: item.author_name, body: item.body, at: item.created_at })),
  }
}

export function voiceFromDesk(desk: DeskWorkspace, now = new Date()): VoiceSnapshot {
  const contacts = new Map(desk.contacts.map((contact) => [contact.id, contact.name]))
  const leadName = (leadId: string | null) => {
    const lead = desk.leads.find((item) => item.id === leadId)
    return lead ? contacts.get(lead.contact_id) || 'Lead' : 'Lead'
  }
  return {
    now: now.toISOString(),
    timezone: 'America/New_York',
    tasks: desk.tasks
      .filter((task) => task.audience === 'staff')
      .map((task) => ({
        id: task.id,
        title: task.title,
        assignee: task.assignee_name,
        dueOn: task.due_on,
        status: task.status,
      })),
    leads: desk.leads.map((lead) => ({
      name: contacts.get(lead.contact_id) || 'Lead',
      stage: lead.stage,
      eventDate: lead.event_date,
      venue: lead.venue_name,
    })),
    tours: desk.tours.map((tour) => ({
      name: leadName(tour.lead_id),
      venue: tour.venue_name,
      startsAt: tour.starts_at,
    })),
  }
}
