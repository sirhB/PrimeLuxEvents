import { createClient } from '@/lib/supabase/server'
import { buildSampleDesk, normalizeStage, type DeskWorkspace, type PipelineStage, type StaffTask } from '@/lib/venues/desk'

export async function loadVenueDesk(): Promise<{ desk: DeskWorkspace; live: boolean }> {
  const sample = buildSampleDesk()
  try {
    const supabase = await createClient()
    const [leads, contacts, companies, activities, tours, holds, proposals, lines, contracts, payments, reminders, tasks, comments, templates, items, views, notifications, schedule, layouts, documents, messages] = await Promise.all([
      supabase.from('venue_leads').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_contacts').select('*'),
      supabase.from('crm_companies').select('*'),
      supabase.from('crm_activities').select('*').order('created_at', { ascending: false }),
      supabase.from('venue_tours').select('*'),
      supabase.from('venue_bookings').select('*'),
      supabase.from('crm_proposals').select('*'),
      supabase.from('crm_proposal_lines').select('*'),
      supabase.from('crm_contracts').select('*'),
      supabase.from('crm_payments').select('*'),
      supabase.from('crm_reminders').select('*'),
      supabase.from('tasks').select('*').not('lead_id', 'is', null),
      supabase.from('task_comments').select('*'),
      supabase.from('task_templates').select('*'),
      supabase.from('task_template_items').select('*'),
      supabase.from('crm_saved_views').select('*'),
      supabase.from('staff_notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_schedule').select('*').order('starts_at', { ascending: true }),
      supabase.from('crm_layouts').select('*'),
      supabase.from('crm_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_messages').select('*').order('created_at', { ascending: true }),
    ])
    if (leads.error || !leads.data) return { desk: sample, live: false }
    const contactRows = contacts.data || []
    const desk: DeskWorkspace = {
      companies: (companies.data || []).map((row) => ({ id: row.id, name: row.name, phone: row.phone, website: row.website })),
      contacts: contactRows.map((row) => ({ id: row.id, company_id: row.company_id, name: row.name, email: row.email, phone: row.phone, title: row.title })),
      leads: leads.data.map((row) => ({
        id: row.id,
        contact_id: row.contact_id || `legacy-${row.id}`,
        company_id: row.company_id,
        venue_id: row.venue_id,
        venue_name: row.venue_name,
        event_date: row.event_date,
        guest_count: row.guest_count,
        stage: normalizeStage(row.stage),
        source: row.source || 'website',
        owner_name: row.owner_name || 'Unassigned',
        value_cents: row.value_cents || 0,
        event_type: row.event_type || 'Event',
      })),
      activities: (activities.data || []).map((row) => ({
        id: row.id,
        lead_id: row.lead_id,
        kind: row.kind === 'call' || row.kind === 'email' || row.kind === 'stage' || row.kind === 'client' ? row.kind : 'note',
        body: row.body,
        author_name: row.author_name || 'Staff',
        created_at: row.created_at,
        visibility: row.visibility === 'client' || row.kind === 'client' || row.kind === 'stage' ? 'client' as const : 'internal' as const,
      })),
      tours: (tours.data || []).map((row) => ({ id: row.id, lead_id: row.lead_id, venue_id: row.venue_id, venue_name: row.venue_name || 'Venue', starts_at: row.starts_at, status: row.status })),
      holds: (holds.data || []).map((row) => ({ id: row.id, lead_id: row.lead_id, venue_id: row.venue_id, venue_name: row.venue_name || 'Venue', starts_on: row.starts_on, ends_on: row.ends_on, status: row.status })),
      proposals: (proposals.data || []).map((row) => ({
        id: row.id,
        lead_id: row.lead_id,
        title: row.title,
        status: row.status,
        lines: (lines.data || []).filter((line) => line.proposal_id === row.id).map((line) => ({ id: line.id, kind: line.kind, name: line.name, quantity: line.quantity, unit_cents: line.unit_cents })),
      })),
      contracts: (contracts.data || []).map((row) => ({ id: row.id, lead_id: row.lead_id, proposal_id: row.proposal_id, status: row.status, signed_at: row.signed_at })),
      payments: (payments.data || []).map((row) => ({ id: row.id, lead_id: row.lead_id, kind: row.kind, status: row.status, amount_cents: row.amount_cents, due_on: row.due_on })),
      reminders: (reminders.data || []).map((row) => ({ id: row.id, lead_id: row.lead_id, due_on: row.due_on, body: row.body, done: row.done, owner_name: row.owner_name || 'Staff' })),
      tasks: (tasks.data || []).map((row) => ({
        id: row.id,
        lead_id: row.lead_id,
        booking_id: row.booking_id,
        title: row.title,
        description: row.description || '',
        status: row.status,
        priority: row.priority,
        assignee_name: row.assigned_to_text || 'Unassigned',
        due_on: row.due_date,
        checklist: Array.isArray(row.checklist) ? row.checklist : [],
        comments: (comments.data || []).filter((comment) => comment.task_id === row.id).map((comment) => ({ id: comment.id, body: comment.body, author_name: comment.author_name || 'Staff', created_at: comment.created_at })),
        template_key: row.template_key,
        audience: row.audience === 'client' ? 'client' as const : 'staff' as const,
      })) as StaffTask[],
      templates: (templates.data && templates.data.length ? templates.data : sample.templates).map((row) => ({
        id: row.id,
        name: row.name,
        trigger_stage: (row.trigger_stage || 'tour') as PipelineStage,
        active: row.active !== false,
        items: (items.data || []).filter((item) => item.template_id === row.id).map((item) => ({
          key: item.item_key,
          title: item.title,
          offset_days: item.offset_days,
          priority: item.priority,
          checklist: item.checklist || [],
        })),
      })),
      views: (views.data || []).map((row) => ({ id: row.id, name: row.name, stage: row.stage || 'all', source: row.source || 'all', owner: row.owner_name || 'all', query: row.query || '' })),
      notices: (notifications.data || []).map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        href: row.href || '/admin/my-tasks',
        read: Boolean(row.read_at),
        kind: row.kind === 'due' ? 'due' as const : 'assignment' as const,
      })),
      schedule: (schedule.data || []).map((row) => ({ id: row.id, lead_id: row.lead_id, starts_at: row.starts_at, title: row.title, notes: row.notes || '' })),
      layouts: (layouts.data || []).map((row) => ({ lead_id: row.lead_id, body: row.body || '', floor_plan_label: row.floor_plan_label || 'Floor plan' })),
      documents: (documents.data || []).map((row) => ({ id: row.id, lead_id: row.lead_id, name: row.name, kind: row.kind === 'vendor' || row.kind === 'inspiration' ? row.kind : 'other', uploaded_by: row.uploaded_by || 'Client', created_at: row.created_at })),
      messages: (messages.data || []).map((row) => ({ id: row.id, lead_id: row.lead_id, author_name: row.author_name || 'Client', role: row.role === 'staff' ? 'staff' as const : 'client' as const, body: row.body, created_at: row.created_at })),
    }
    if (!desk.contacts.length) {
      desk.contacts = desk.leads.map((lead) => ({
        id: lead.contact_id,
        company_id: lead.company_id,
        name: leads.data.find((row) => row.id === lead.id)?.contact_name || 'Contact',
        email: leads.data.find((row) => row.id === lead.id)?.contact_email || '',
        phone: leads.data.find((row) => row.id === lead.id)?.contact_phone || null,
        title: null,
      }))
    }
    if (!desk.templates.length || desk.templates.every((item) => item.items.length === 0)) desk.templates = sample.templates
    return { desk, live: true }
  } catch {
    return { desk: sample, live: false }
  }
}
