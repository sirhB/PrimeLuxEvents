import { createClient } from '@/lib/supabase/server'
import { normalizeStage, toClientHub, type ClientHub, type DeskWorkspace, type PipelineStage, type StaffTask } from '@/lib/venues/desk'

const OPEN = new Set(['inquiry', 'tour', 'proposal', 'contract', 'deposit', 'booked'])

export async function loadClientHub(): Promise<{ hub: ClientHub | null; live: boolean }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { hub: null, live: false }
    const email = user.email?.toLowerCase() || ''
    const [leads, contacts, activities, tours, proposals, lines, contracts, payments, tasks, schedule, layouts, documents, messages] = await Promise.all([
      supabase.from('venue_leads').select('*'),
      supabase.from('crm_contacts').select('*'),
      supabase.from('crm_activities').select('*').order('created_at', { ascending: false }),
      supabase.from('venue_tours').select('*'),
      supabase.from('crm_proposals').select('*'),
      supabase.from('crm_proposal_lines').select('*'),
      supabase.from('crm_contracts').select('*'),
      supabase.from('crm_payments').select('*'),
      supabase.from('tasks').select('*').eq('audience', 'client'),
      supabase.from('crm_schedule').select('*'),
      supabase.from('crm_layouts').select('*'),
      supabase.from('crm_documents').select('*'),
      supabase.from('crm_messages').select('*'),
    ])
    if (leads.error || !leads.data?.length) return { hub: null, live: false }
    const contactRows = contacts.data || []
    const mine = leads.data.filter((row) => {
      const contact = contactRows.find((item) => item.id === row.contact_id)
      const contactEmail = (contact?.email || row.contact_email || '').toLowerCase()
      return row.client_user_id === user.id || (email && contactEmail === email)
    })
    if (!mine.length) return { hub: null, live: false }
    const ids = new Set(mine.map((row) => row.id))
    const keep = <T extends { lead_id?: string }>(rows: T[] | null) => (rows || []).filter((row) => row.lead_id && ids.has(row.lead_id))
    const desk: DeskWorkspace = {
      companies: [],
      contacts: contactRows.filter((row) => mine.some((lead) => lead.contact_id === row.id)).map((row) => ({
        id: row.id, company_id: row.company_id, name: row.name, email: row.email, phone: row.phone, title: row.title,
      })),
      leads: mine.map((row) => ({
        id: row.id,
        contact_id: row.contact_id || `legacy-${row.id}`,
        company_id: row.company_id,
        venue_id: row.venue_id,
        venue_name: row.venue_name,
        event_date: row.event_date,
        guest_count: row.guest_count,
        stage: normalizeStage(row.stage),
        source: row.source || 'website',
        owner_name: row.owner_name || 'Your coordinator',
        value_cents: row.value_cents || 0,
        event_type: row.event_type || 'Event',
      })),
      activities: keep(activities.data).map((row) => ({
        id: row.id,
        lead_id: row.lead_id,
        kind: row.kind === 'call' || row.kind === 'email' || row.kind === 'stage' || row.kind === 'client' ? row.kind : 'note' as const,
        body: row.body,
        author_name: row.author_name || 'Prime Lux',
        created_at: row.created_at,
        visibility: row.visibility === 'internal' ? 'internal' as const : 'client' as const,
      })),
      tours: keep(tours.data).map((row) => ({ id: row.id, lead_id: row.lead_id, venue_id: row.venue_id, venue_name: row.venue_name || 'Venue', starts_at: row.starts_at, status: row.status })),
      holds: [],
      proposals: keep(proposals.data).map((row) => ({
        id: row.id,
        lead_id: row.lead_id,
        title: row.title,
        status: row.status,
        lines: (lines.data || []).filter((line) => line.proposal_id === row.id).map((line) => ({ id: line.id, kind: line.kind, name: line.name, quantity: line.quantity, unit_cents: line.unit_cents })),
      })),
      contracts: keep(contracts.data).map((row) => ({ id: row.id, lead_id: row.lead_id, proposal_id: row.proposal_id, status: row.status, signed_at: row.signed_at })),
      payments: keep(payments.data).map((row) => ({ id: row.id, lead_id: row.lead_id, kind: row.kind, status: row.status, amount_cents: row.amount_cents, due_on: row.due_on })),
      reminders: [],
      tasks: keep(tasks.data).map((row) => ({
        id: row.id,
        lead_id: row.lead_id,
        booking_id: row.booking_id,
        title: row.title,
        description: row.description || '',
        status: row.status,
        priority: row.priority,
        assignee_name: row.assigned_to_text || 'You',
        due_on: row.due_date,
        checklist: Array.isArray(row.checklist) ? row.checklist : [],
        comments: [],
        template_key: row.template_key,
        audience: 'client' as const,
      })) as StaffTask[],
      templates: [],
      views: [],
      notices: [],
      schedule: keep(schedule.data).map((row) => ({ id: row.id, lead_id: row.lead_id, starts_at: row.starts_at, title: row.title, notes: row.notes || '' })),
      layouts: keep(layouts.data).map((row) => ({ lead_id: row.lead_id, body: row.body || '', floor_plan_label: row.floor_plan_label || 'Floor plan' })),
      documents: keep(documents.data).map((row) => ({ id: row.id, lead_id: row.lead_id, name: row.name, kind: row.kind === 'vendor' || row.kind === 'inspiration' ? row.kind : 'other', uploaded_by: row.uploaded_by || 'You', created_at: row.created_at })),
      messages: keep(messages.data).map((row) => ({ id: row.id, lead_id: row.lead_id, author_name: row.author_name || 'You', role: row.role === 'staff' ? 'staff' as const : 'client' as const, body: row.body, created_at: row.created_at })),
    }
    if (!desk.contacts.length) {
      desk.contacts = desk.leads.map((lead) => {
        const row = mine.find((item) => item.id === lead.id)
        return { id: lead.contact_id, company_id: null, name: row?.contact_name || 'You', email: row?.contact_email || email, phone: row?.contact_phone || null, title: null }
      })
    }
    const chosen = [...desk.leads].sort((a, b) => {
      const aOpen = OPEN.has(a.stage) ? 0 : 1
      const bOpen = OPEN.has(b.stage) ? 0 : 1
      if (aOpen !== bOpen) return aOpen - bOpen
      return (a.event_date || '9999').localeCompare(b.event_date || '9999')
    })[0]
    return { hub: toClientHub(desk, chosen.id), live: true }
  } catch {
    return { hub: null, live: false }
  }
}

export type { PipelineStage }
