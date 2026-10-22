import { VENUE_LISTINGS } from './directory'

export const PIPELINE_STAGES = [
  { id: 'inquiry', label: 'Inquiry' },
  { id: 'tour', label: 'Tour' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'contract', label: 'Contract' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'booked', label: 'Booked' },
  { id: 'completed', label: 'Completed' },
  { id: 'lost', label: 'Lost' },
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]['id']

export const LEAD_SOURCES = ['website', 'phone', 'planner', 'referral', 'event_plan', 'venue_page', 'plan_flow'] as const
export type LeadSource = (typeof LEAD_SOURCES)[number]

export const OPEN_STAGES: PipelineStage[] = ['inquiry', 'tour', 'proposal', 'contract', 'deposit', 'booked']

export type CheckItem = { id: string; label: string; done: boolean }

export type Company = { id: string; name: string; phone: string | null; website: string | null }
export type Contact = { id: string; company_id: string | null; name: string; email: string; phone: string | null; title: string | null }

export type Activity = {
  id: string
  lead_id: string
  kind: 'note' | 'call' | 'email' | 'stage' | 'client'
  body: string
  author_name: string
  created_at: string
  visibility?: 'internal' | 'client'
}

export type Tour = { id: string; lead_id: string; venue_id: string | null; venue_name: string; starts_at: string; status: string }
export type Hold = { id: string; lead_id: string; venue_id: string | null; venue_name: string; starts_on: string; ends_on: string; status: string }

export type ProposalLine = { id: string; kind: 'rental' | 'service'; name: string; quantity: number; unit_cents: number }
export type Proposal = { id: string; lead_id: string; title: string; status: 'draft' | 'sent' | 'accepted' | 'declined'; lines: ProposalLine[] }

export type Contract = { id: string; lead_id: string; proposal_id: string | null; status: 'draft' | 'sent' | 'signed'; signed_at: string | null }
export type Payment = { id: string; lead_id: string; kind: 'deposit' | 'balance' | 'other'; status: 'due' | 'paid' | 'waived'; amount_cents: number; due_on: string | null }

export type Reminder = { id: string; lead_id: string; due_on: string; body: string; done: boolean; owner_name: string }

export type StaffTask = {
  id: string
  lead_id: string | null
  booking_id: string | null
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee_name: string
  due_on: string | null
  checklist: CheckItem[]
  comments: { id: string; body: string; author_name: string; created_at: string }[]
  template_key: string | null
  audience: 'staff' | 'client'
}

export type RunCue = { id: string; lead_id: string; starts_at: string; title: string; notes: string }
export type LayoutNote = { lead_id: string; body: string; floor_plan_label: string }
export type ClientDocument = { id: string; lead_id: string; name: string; kind: 'vendor' | 'inspiration' | 'other'; uploaded_by: string; created_at: string }
export type ClientMessage = { id: string; lead_id: string; author_name: string; role: 'client' | 'staff'; body: string; created_at: string }

export type ClientChange =
  | { type: 'details'; guest_count: number; details: string }
  | { type: 'message'; body: string }
  | { type: 'document'; name: string; kind: ClientDocument['kind'] }
  | { type: 'sign'; name: string }
  | { type: 'complete_task'; taskId: string }

export type TaskTemplateItem = {
  key: string
  title: string
  offset_days: number
  priority: StaffTask['priority']
  checklist: string[]
}

export type TaskTemplate = {
  id: string
  name: string
  trigger_stage: PipelineStage
  active: boolean
  items: TaskTemplateItem[]
}

export type SavedView = { id: string; name: string; stage: PipelineStage | 'all'; source: string; owner: string; query: string }
export type Notice = { id: string; title: string; body: string; href: string; read: boolean; kind: 'assignment' | 'due' }

export type Lead = {
  id: string
  contact_id: string
  company_id: string | null
  venue_id: string | null
  venue_name: string | null
  event_date: string | null
  guest_count: number | null
  stage: PipelineStage
  source: string
  owner_name: string
  value_cents: number
  event_type: string
  budget_range?: string | null
  consent?: boolean
}

export type LeadCartLine = { id: string; name: string; quantity: number; unit_cents: number; product_id?: string | null; package_id?: string | null }
export type LeadCart = { lead_id: string; items: LeadCartLine[]; item_count: number; subtotal_cents: number; updated_at: string; checked_out_at: string | null }

export type DeskWorkspace = {
  companies: Company[]
  contacts: Contact[]
  leads: Lead[]
  activities: Activity[]
  tours: Tour[]
  holds: Hold[]
  proposals: Proposal[]
  contracts: Contract[]
  payments: Payment[]
  reminders: Reminder[]
  tasks: StaffTask[]
  templates: TaskTemplate[]
  views: SavedView[]
  notices: Notice[]
  schedule: RunCue[]
  layouts: LayoutNote[]
  documents: ClientDocument[]
  messages: ClientMessage[]
  /** Server-side carts from the Plan-your-event flow (optional for older callers). */
  carts?: LeadCart[]
}

export function normalizeStage(stage: string | null | undefined): PipelineStage {
  if (stage === 'new' || stage === 'contacted') return 'inquiry'
  if (PIPELINE_STAGES.some((item) => item.id === stage)) return stage as PipelineStage
  return 'inquiry'
}

export function isoOffset(days: number, from = new Date()) {
  const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd
}

export function findHoldConflicts(holds: Hold[], venueId: string | null, starts: string, ends: string, excludeId?: string) {
  if (!venueId) return []
  return holds.filter((hold) =>
    hold.venue_id === venueId
    && hold.id !== excludeId
    && hold.status !== 'released'
    && hold.status !== 'cancelled'
    && rangesOverlap(hold.starts_on, hold.ends_on, starts, ends),
  )
}

export function proposalTotal(proposal: Proposal) {
  return proposal.lines.reduce((sum, line) => sum + line.quantity * line.unit_cents, 0)
}

export function defaultTemplates(): TaskTemplate[] {
  return [
    {
      id: 'tpl-tour',
      name: 'Tour booked',
      trigger_stage: 'tour',
      active: true,
      items: [
        { key: 'tour-confirm', title: 'Confirm the tour time', offset_days: 0, priority: 'high', checklist: ['Call the contact', 'Send the address'] },
        { key: 'tour-prep', title: 'Prep the room', offset_days: -1, priority: 'medium', checklist: ['Lights', 'Chairs for the walk-through'] },
        { key: 'tour-directions', title: 'Send directions and parking', offset_days: -1, priority: 'low', checklist: ['Map link', 'Door code'] },
      ],
    },
    {
      id: 'tpl-booked',
      name: 'Booking confirmed',
      trigger_stage: 'booked',
      active: true,
      items: [
        { key: 'book-setup', title: 'Setup checklist', offset_days: -2, priority: 'high', checklist: ['Floor plan', 'Rentals staged', 'Power'] },
        { key: 'book-teardown', title: 'Teardown checklist', offset_days: 1, priority: 'medium', checklist: ['Strike time', 'Truck', 'Lost and found'] },
        { key: 'book-vendors', title: 'Vendor checklist', offset_days: -7, priority: 'high', checklist: ['Caterer', 'Florist', 'Band load-in'] },
      ],
    },
  ]
}

function stamp() {
  return new Date().toISOString()
}

export function tasksForStage(desk: DeskWorkspace, lead: Lead, stage: PipelineStage): StaffTask[] {
  const template = desk.templates.find((item) => item.active && item.trigger_stage === stage)
  if (!template) return []
  const dueBase = lead.event_date || isoOffset(14)
  return template.items
    .filter((item) => !desk.tasks.some((task) => task.lead_id === lead.id && task.template_key === item.key))
    .map((item) => ({
      id: `${lead.id}:${item.key}`,
      lead_id: lead.id,
      booking_id: null,
      title: item.title,
      description: `${template.name} for ${lead.event_type || 'the event'}.`,
      status: 'pending' as const,
      priority: item.priority,
      assignee_name: lead.owner_name || 'Unassigned',
      due_on: isoOffset(item.offset_days, new Date(`${dueBase}T00:00:00Z`)),
      checklist: item.checklist.map((label) => label.trim()).filter(Boolean).map((label, index) => ({ id: `${item.key}-${index}`, label, done: false })),
      comments: [],
      template_key: item.key,
      audience: 'staff',
    }))
}

export function applyStage(desk: DeskWorkspace, leadId: string, stage: PipelineStage, author = 'You'): DeskWorkspace {
  const lead = desk.leads.find((item) => item.id === leadId)
  if (!lead || lead.stage === stage) return desk
  const from = PIPELINE_STAGES.find((item) => item.id === lead.stage)?.label || lead.stage
  const to = PIPELINE_STAGES.find((item) => item.id === stage)?.label || stage
  const nextLead = { ...lead, stage }
  const spawned = tasksForStage({ ...desk, leads: desk.leads.map((item) => item.id === leadId ? nextLead : item) }, nextLead, stage)
  const notices = spawned.map((task) => ({
    id: `notice-${task.id}`,
    title: 'Task assigned',
    body: `${task.title} is assigned to ${task.assignee_name}.`,
    href: '/admin/my-tasks',
    read: false,
    kind: 'assignment' as const,
  }))
  return {
    ...desk,
    leads: desk.leads.map((item) => item.id === leadId ? nextLead : item),
    tasks: [...spawned, ...desk.tasks],
    activities: [{
      id: `act-${leadId}-${stage}`,
      lead_id: leadId,
      kind: 'stage',
      body: `Stage moved from ${from} to ${to}.`,
      author_name: author,
      created_at: stamp(),
      visibility: 'client',
    }, ...desk.activities],
    notices: [...notices, ...desk.notices],
  }
}

export function pipelineValue(leads: Lead[]) {
  return leads.filter((lead) => OPEN_STAGES.includes(lead.stage)).reduce((sum, lead) => sum + lead.value_cents, 0)
}

export function conversionRate(leads: Lead[]) {
  if (!leads.length) return 0
  const won = leads.filter((lead) => lead.stage === 'booked' || lead.stage === 'completed' || lead.stage === 'deposit').length
  return won / leads.length
}

export function sourceBreakdown(leads: Lead[]) {
  const counts = new Map<string, { count: number; value: number }>()
  for (const lead of leads) {
    const row = counts.get(lead.source) || { count: 0, value: 0 }
    row.count += 1
    row.value += lead.value_cents
    counts.set(lead.source, row)
  }
  return [...counts.entries()].map(([source, row]) => ({ source, ...row }))
}

export function isOverdue(task: StaffTask, today = isoOffset(0)) {
  return Boolean(task.due_on && task.due_on < today && task.status !== 'completed' && task.status !== 'cancelled')
}

export function isToday(task: StaffTask, today = isoOffset(0)) {
  return task.due_on === today && task.status !== 'completed' && task.status !== 'cancelled'
}

export function buildSampleDesk(now = new Date()): DeskWorkspace {
  const today = isoOffset(0, now)
  const companies: Company[] = [
    { id: 'co-cole', name: 'Cole Atelier', phone: '(203) 555-0148', website: 'coleatelier.example' },
    { id: 'co-hale', name: 'Hale Studio', phone: '(203) 555-0194', website: null },
  ]
  const contacts: Contact[] = [
    { id: 'ct-avery', company_id: 'co-cole', name: 'Avery Cole', email: 'avery.cole@example.com', phone: '(203) 555-0148', title: 'Principal' },
    { id: 'ct-jordan', company_id: 'co-hale', name: 'Jordan Hale', email: 'jordan.hale@example.com', phone: '(203) 555-0194', title: 'Producer' },
    { id: 'ct-rene', company_id: null, name: 'René Patel', email: 'rene.patel@example.com', phone: '(475) 555-0112', title: null },
    { id: 'ct-nina', company_id: null, name: 'Nina Voss', email: 'nina.voss@example.com', phone: '(203) 555-0166', title: null },
    { id: 'ct-luis', company_id: null, name: 'Luis Ortega', email: 'luis.ortega@example.com', phone: '(860) 555-0177', title: null },
    { id: 'ct-priya', company_id: null, name: 'Priya Shah', email: 'priya.shah@example.com', phone: '(203) 555-0188', title: null },
    { id: 'ct-ellen', company_id: null, name: 'Ellen Cho', email: 'ellen.cho@example.com', phone: '(203) 555-0133', title: null },
    { id: 'ct-maya', company_id: null, name: 'Maya Brooks', email: 'maya.brooks@example.com', phone: '(203) 555-0157', title: null },
    { id: 'ct-sam', company_id: null, name: 'Sam Idris', email: 'sam.idris@example.com', phone: '(203) 555-0120', title: null },
  ]
  const leads: Lead[] = [
    { id: 'lead-avery', contact_id: 'ct-avery', company_id: 'co-cole', venue_id: '11111111-1111-4111-8111-111111111111', venue_name: 'The Conservatory', event_date: '2026-11-14', guest_count: 140, stage: 'tour', source: 'website', owner_name: 'Mara Quinn', value_cents: 2_800_000, event_type: 'Wedding' },
    { id: 'lead-jordan', contact_id: 'ct-jordan', company_id: 'co-hale', venue_id: '22222222-2222-4222-8222-222222222222', venue_name: 'The Gallery', event_date: '2026-12-04', guest_count: 60, stage: 'inquiry', source: 'phone', owner_name: 'Chris Adeyemi', value_cents: 950_000, event_type: 'Private dinner' },
    { id: 'lead-rene', contact_id: 'ct-rene', company_id: null, venue_id: '33333333-3333-4333-8333-333333333333', venue_name: 'The Garden Court', event_date: '2027-05-22', guest_count: 110, stage: 'proposal', source: 'planner', owner_name: 'Mara Quinn', value_cents: 2_200_000, event_type: 'Wedding' },
    { id: 'lead-nina', contact_id: 'ct-nina', company_id: null, venue_id: '11111111-1111-4111-8111-111111111111', venue_name: 'The Conservatory', event_date: '2026-11-21', guest_count: 160, stage: 'contract', source: 'referral', owner_name: 'Chris Adeyemi', value_cents: 4_100_000, event_type: 'Wedding' },
    { id: 'lead-luis', contact_id: 'ct-luis', company_id: null, venue_id: '22222222-2222-4222-8222-222222222222', venue_name: 'The Gallery', event_date: '2027-01-16', guest_count: 70, stage: 'deposit', source: 'website', owner_name: 'Mara Quinn', value_cents: 1_800_000, event_type: 'Corporate' },
    { id: 'lead-priya', contact_id: 'ct-priya', company_id: null, venue_id: '11111111-1111-4111-8111-111111111111', venue_name: 'The Conservatory', event_date: '2026-11-14', guest_count: 120, stage: 'booked', source: 'planner', owner_name: 'Chris Adeyemi', value_cents: 3_600_000, event_type: 'Wedding' },
    { id: 'lead-ellen', contact_id: 'ct-ellen', company_id: null, venue_id: '33333333-3333-4333-8333-333333333333', venue_name: 'The Garden Court', event_date: '2026-09-12', guest_count: 80, stage: 'completed', source: 'website', owner_name: 'Mara Quinn', value_cents: 1_500_000, event_type: 'Birthday' },
    { id: 'lead-maya', contact_id: 'ct-maya', company_id: null, venue_id: null, venue_name: 'Own venue · Westport', event_date: '2027-06-12', guest_count: 150, stage: 'inquiry', source: 'plan_flow', owner_name: 'Unassigned', value_cents: 0, event_type: 'Wedding', budget_range: '$7,500–$15,000', consent: true },
    { id: 'lead-sam', contact_id: 'ct-sam', company_id: null, venue_id: null, venue_name: null, event_date: '2026-10-30', guest_count: 40, stage: 'lost', source: 'phone', owner_name: 'Unassigned', value_cents: 1_200_000, event_type: 'Other' },
  ]
  const tasks: StaffTask[] = [
    {
      id: 'task-confirm',
      lead_id: 'lead-avery',
      booking_id: null,
      title: 'Confirm the tour time',
      description: 'Tour booked for Avery Cole.',
      status: 'pending',
      priority: 'high',
      assignee_name: 'Mara Quinn',
      due_on: today,
      checklist: [
        { id: 'c1', label: 'Call the contact', done: true },
        { id: 'c2', label: 'Send the address', done: false },
      ],
      comments: [{ id: 'cm1', body: 'Left a voicemail at 9:40.', author_name: 'Mara Quinn', created_at: `${today}T13:40:00Z` }],
      template_key: 'tour-confirm',
      audience: 'staff',
    },
    {
      id: 'task-prep',
      lead_id: 'lead-avery',
      booking_id: null,
      title: 'Prep the room',
      description: 'Walk-through setup for The Conservatory.',
      status: 'in_progress',
      priority: 'medium',
      assignee_name: 'Mara Quinn',
      due_on: isoOffset(-2, now),
      checklist: [
        { id: 'c3', label: 'Lights', done: false },
        { id: 'c4', label: 'Chairs for the walk-through', done: false },
      ],
      comments: [],
      template_key: 'tour-prep',
      audience: 'staff',
    },
    {
      id: 'task-vendors',
      lead_id: 'lead-priya',
      booking_id: 'hold-priya',
      title: 'Vendor checklist',
      description: 'Booking confirmed for Priya Shah.',
      status: 'pending',
      priority: 'high',
      assignee_name: 'Chris Adeyemi',
      due_on: isoOffset(3, now),
      checklist: [
        { id: 'c5', label: 'Caterer', done: false },
        { id: 'c6', label: 'Florist', done: true },
        { id: 'c7', label: 'Band load-in', done: false },
      ],
      comments: [],
      template_key: 'book-vendors',
      audience: 'staff',
    },
    {
      id: 'task-guests',
      lead_id: 'lead-avery',
      booking_id: null,
      title: 'Confirm your guest count',
      description: 'Shared with Avery Cole.',
      status: 'pending',
      priority: 'medium',
      assignee_name: 'Avery Cole',
      due_on: isoOffset(3, now),
      checklist: [],
      comments: [],
      template_key: null,
      audience: 'client',
    },
    {
      id: 'task-inspiration',
      lead_id: 'lead-avery',
      booking_id: null,
      title: 'Upload inspiration',
      description: 'Shared with Avery Cole.',
      status: 'pending',
      priority: 'low',
      assignee_name: 'Avery Cole',
      due_on: isoOffset(6, now),
      checklist: [],
      comments: [],
      template_key: null,
      audience: 'client',
    },
    {
      id: 'task-vendors-client',
      lead_id: 'lead-avery',
      booking_id: null,
      title: 'Send vendor contacts',
      description: 'Shared with Avery Cole.',
      status: 'pending',
      priority: 'medium',
      assignee_name: 'Avery Cole',
      due_on: isoOffset(8, now),
      checklist: [],
      comments: [],
      template_key: null,
      audience: 'client',
    },
  ]
  return {
    companies,
    contacts,
    leads,
    carts: [
      {
        lead_id: 'lead-maya',
        items: [
          { id: 'c1', name: 'Gold Chiavari chair', quantity: 150, unit_cents: 900 },
          { id: 'c2', name: '8 ft farm table', quantity: 15, unit_cents: 6500 },
          { id: 'c3', name: 'Crystal chandelier', quantity: 3, unit_cents: 22500 },
          { id: 'c4', name: 'Ivory linen, 90 × 156', quantity: 15, unit_cents: 2800 },
        ],
        item_count: 183,
        subtotal_cents: 150 * 900 + 15 * 6500 + 3 * 22500 + 15 * 2800,
        updated_at: `${isoOffset(-5, now)}T21:40:00Z`,
        checked_out_at: null,
      },
      {
        lead_id: 'lead-avery',
        items: [{ id: 'c5', name: 'Velvet lounge set', quantity: 2, unit_cents: 45000 }],
        item_count: 2,
        subtotal_cents: 90000,
        updated_at: `${isoOffset(-1, now)}T14:00:00Z`,
        checked_out_at: null,
      },
    ],
    activities: [
      { id: 'act1', lead_id: 'lead-avery', kind: 'email', body: 'Sent the Conservatory lookbook and November dates.', author_name: 'Mara Quinn', created_at: `${isoOffset(-3, now)}T15:00:00Z`, visibility: 'client' },
      { id: 'act2', lead_id: 'lead-avery', kind: 'call', body: 'Spoke for twelve minutes. They want a ceremony and a seated dinner.', author_name: 'Mara Quinn', created_at: `${isoOffset(-1, now)}T18:10:00Z`, visibility: 'internal' },
      { id: 'act3', lead_id: 'lead-avery', kind: 'note', body: 'Asked for a late-afternoon ceremony.', author_name: 'Mara Quinn', created_at: `${today}T14:00:00Z`, visibility: 'internal' },
      { id: 'act4', lead_id: 'lead-avery', kind: 'client', body: 'Updated the guest count to 140.', author_name: 'Avery Cole', created_at: `${isoOffset(-2, now)}T16:20:00Z`, visibility: 'client' },
    ],
    tours: [
      { id: 'tour-avery', lead_id: 'lead-avery', venue_id: '11111111-1111-4111-8111-111111111111', venue_name: 'The Conservatory', starts_at: `${isoOffset(4, now)}T18:00:00Z`, status: 'scheduled' },
    ],
    holds: [
      { id: 'hold-priya', lead_id: 'lead-priya', venue_id: '11111111-1111-4111-8111-111111111111', venue_name: 'The Conservatory', starts_on: '2026-11-14', ends_on: '2026-11-15', status: 'booked' },
    ],
    proposals: [
      {
        id: 'prop-avery',
        lead_id: 'lead-avery',
        title: 'Conservatory wedding',
        status: 'sent',
        lines: [
          { id: 'ln1', kind: 'rental', name: 'Conservatory room', quantity: 1, unit_cents: 1_800_000 },
          { id: 'ln2', kind: 'service', name: 'Planning', quantity: 1, unit_cents: 600_000 },
          { id: 'ln3', kind: 'rental', name: 'Lighting package', quantity: 1, unit_cents: 400_000 },
        ],
      },
    ],
    contracts: [
      { id: 'con-avery', lead_id: 'lead-avery', proposal_id: 'prop-avery', status: 'sent', signed_at: null },
      { id: 'con-nina', lead_id: 'lead-nina', proposal_id: null, status: 'sent', signed_at: null },
      { id: 'con-priya', lead_id: 'lead-priya', proposal_id: null, status: 'signed', signed_at: `${isoOffset(-6, now)}T00:00:00Z` },
    ],
    payments: [
      { id: 'pay-avery', lead_id: 'lead-avery', kind: 'deposit', status: 'due', amount_cents: 800_000, due_on: isoOffset(10, now) },
      { id: 'pay-priya', lead_id: 'lead-priya', kind: 'deposit', status: 'paid', amount_cents: 1_200_000, due_on: isoOffset(-8, now) },
      { id: 'pay-luis', lead_id: 'lead-luis', kind: 'deposit', status: 'paid', amount_cents: 500_000, due_on: isoOffset(-2, now) },
    ],
    reminders: [
      { id: 'rem1', lead_id: 'lead-avery', due_on: isoOffset(1, now), body: 'Follow up on the lighting package.', done: false, owner_name: 'Mara Quinn' },
    ],
    tasks,
    templates: defaultTemplates(),
    views: [
      { id: 'view-mine', name: 'My open leads', stage: 'all', source: 'all', owner: 'Mara Quinn', query: '' },
      { id: 'view-web', name: 'Website inquiries', stage: 'inquiry', source: 'website', owner: 'all', query: '' },
    ],
    notices: [
      { id: 'n-assign', title: 'Task assigned', body: 'Confirm the tour time is on your list for today.', href: '/admin/my-tasks', read: false, kind: 'assignment' },
      { id: 'n-due', title: 'Task overdue', body: 'Prep the room was due two days ago.', href: '/admin/my-tasks', read: false, kind: 'due' },
    ],
    schedule: [
      { id: 'cue-1', lead_id: 'lead-avery', starts_at: '16:00', title: 'Guests arrive', notes: 'Lawn doors open. Coat check in the foyer.' },
      { id: 'cue-2', lead_id: 'lead-avery', starts_at: '16:30', title: 'Ceremony', notes: 'Facing the glass. Seating for 140.' },
      { id: 'cue-3', lead_id: 'lead-avery', starts_at: '17:15', title: 'Cocktails', notes: 'Passed bites. Lounge on the west wall.' },
      { id: 'cue-4', lead_id: 'lead-avery', starts_at: '18:30', title: 'Dinner', notes: 'Long table under the ridge.' },
      { id: 'cue-5', lead_id: 'lead-avery', starts_at: '20:00', title: 'Dancing', notes: 'Floor clears to the stone.' },
    ],
    layouts: [
      { lead_id: 'lead-avery', floor_plan_label: 'Conservatory, ceremony and dinner', body: 'Ceremony faces the glass. Dinner is a single long table. The dance floor takes the west end after the cake is cut. Keep the bridal room closed during cocktails.' },
    ],
    documents: [
      { id: 'doc-1', lead_id: 'lead-avery', name: 'Florist agreement.pdf', kind: 'vendor', uploaded_by: 'Avery Cole', created_at: `${isoOffset(-1, now)}T12:00:00Z` },
      { id: 'doc-2', lead_id: 'lead-avery', name: 'Evening light references', kind: 'inspiration', uploaded_by: 'Avery Cole', created_at: `${today}T09:10:00Z` },
    ],
    messages: [
      { id: 'msg-1', lead_id: 'lead-avery', author_name: 'Mara Quinn', role: 'staff', body: 'The Conservatory is held for the afternoon of the 14th. I will walk you through the room on the tour.', created_at: `${isoOffset(-2, now)}T15:00:00Z` },
      { id: 'msg-2', lead_id: 'lead-avery', author_name: 'Avery Cole', role: 'client', body: 'Can we add a small lounge for the cocktail hour, away from the ceremony chairs?', created_at: `${isoOffset(-1, now)}T19:40:00Z` },
    ],
  }
}

export type ClientHub = {
  lead: Lead
  contact: Contact | null
  venue: { name: string; neighborhood: string; city: string; capacity: number; description: string; amenities: string[] } | null
  timeline: Activity[]
  schedule: RunCue[]
  layout: LayoutNote | null
  proposalTitle: string | null
  proposalStatus: Proposal['status'] | null
  lines: ProposalLine[]
  totalCents: number
  contract: Contract | null
  payments: Payment[]
  tasks: StaffTask[]
  documents: ClientDocument[]
  messages: ClientMessage[]
  meetings: { id: string; when: string; label: string; place: string }[]
  coordinator: string
}

export function clientCanSeeActivity(activity: Activity) {
  if (activity.visibility) return activity.visibility === 'client'
  return activity.kind === 'client' || activity.kind === 'stage'
}

export function deskFromHub(hub: ClientHub): DeskWorkspace {
  return {
    companies: [],
    contacts: hub.contact ? [hub.contact] : [],
    leads: [hub.lead],
    activities: hub.timeline,
    tours: hub.meetings.map((item) => ({
      id: item.id,
      lead_id: hub.lead.id,
      venue_id: hub.lead.venue_id,
      venue_name: item.place,
      starts_at: item.when.includes('T') ? item.when : item.when.replace(' ', 'T'),
      status: 'scheduled',
    })),
    holds: [],
    proposals: hub.proposalTitle
      ? [{ id: hub.contract?.proposal_id || 'proposal', lead_id: hub.lead.id, title: hub.proposalTitle, status: hub.proposalStatus || 'sent', lines: hub.lines }]
      : [],
    contracts: hub.contract ? [hub.contract] : [],
    payments: hub.payments,
    reminders: [],
    tasks: hub.tasks,
    templates: [],
    views: [],
    notices: [],
    schedule: hub.schedule,
    layouts: hub.layout ? [hub.layout] : [],
    documents: hub.documents,
    messages: hub.messages,
  }
}

export function toClientHub(desk: DeskWorkspace, leadId: string): ClientHub | null {
  const lead = desk.leads.find((item) => item.id === leadId)
  if (!lead) return null
  const listing = VENUE_LISTINGS.find((item) => item.id === lead.venue_id) || null
  const proposal = desk.proposals.find((item) => item.lead_id === lead.id && item.status !== 'draft')
  return {
    lead,
    contact: desk.contacts.find((item) => item.id === lead.contact_id) || null,
    venue: listing
      ? { name: listing.name, neighborhood: listing.neighborhood, city: listing.city, capacity: listing.capacity, description: listing.description, amenities: listing.amenities }
      : lead.venue_name
        ? { name: lead.venue_name, neighborhood: '', city: '', capacity: 0, description: '', amenities: [] }
        : null,
    timeline: desk.activities.filter((item) => item.lead_id === lead.id && clientCanSeeActivity(item)).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    schedule: desk.schedule.filter((item) => item.lead_id === lead.id).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    layout: desk.layouts.find((item) => item.lead_id === lead.id) || null,
    proposalTitle: proposal?.title || null,
    proposalStatus: proposal?.status || null,
    lines: proposal?.lines || [],
    totalCents: proposal ? proposalTotal(proposal) : lead.value_cents,
    contract: desk.contracts.find((item) => item.lead_id === lead.id) || null,
    payments: desk.payments.filter((item) => item.lead_id === lead.id),
    tasks: desk.tasks.filter((item) => item.lead_id === lead.id && item.audience === 'client' && item.status !== 'cancelled'),
    documents: desk.documents.filter((item) => item.lead_id === lead.id),
    messages: desk.messages.filter((item) => item.lead_id === lead.id).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    meetings: desk.tours.filter((item) => item.lead_id === lead.id && item.status !== 'cancelled').map((item) => ({
      id: item.id,
      when: item.starts_at.slice(0, 16).replace('T', ' '),
      label: 'Tour',
      place: item.venue_name,
    })),
    coordinator: lead.owner_name || 'Your coordinator',
  }
}

function hubId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export function applyClientChange(desk: DeskWorkspace, leadId: string, change: ClientChange): DeskWorkspace {
  const lead = desk.leads.find((item) => item.id === leadId)
  if (!lead) return desk
  const author = contactName(desk, lead.contact_id)
  const now = new Date().toISOString()
  const activity = (body: string): Activity => ({
    id: hubId('act'),
    lead_id: leadId,
    kind: 'client',
    body,
    author_name: author,
    created_at: now,
    visibility: 'client',
  })
  const taskFor = (title: string, body: string): StaffTask => ({
    id: hubId('staff'),
    lead_id: leadId,
    booking_id: null,
    title,
    description: body,
    status: 'pending',
    priority: 'high',
    assignee_name: lead.owner_name || 'Unassigned',
    due_on: isoOffset(1),
    checklist: [],
    comments: [],
    template_key: null,
    audience: 'staff',
  })
  const withStaff = (body: string, title: string, patch: Partial<DeskWorkspace> = {}): DeskWorkspace => {
    const spawned = taskFor(title, body)
    return {
      ...desk,
      ...patch,
      leads: patch.leads || desk.leads,
      activities: [activity(body), ...desk.activities],
      tasks: [spawned, ...(patch.tasks || desk.tasks)],
      notices: [{ id: hubId('notice'), title: 'Task assigned', body: title, href: '/admin/my-tasks', read: false, kind: 'assignment' }, ...desk.notices],
    }
  }

  if (change.type === 'details') {
    const count = Math.max(1, Math.round(change.guest_count))
    const body = change.details.trim()
      ? `Updated the guest count to ${count}. ${change.details.trim()}`
      : `Updated the guest count to ${count}.`
    return withStaff(body, `Review guest count for ${author}`, {
      leads: desk.leads.map((item) => item.id === leadId ? { ...item, guest_count: count } : item),
    })
  }
  if (change.type === 'message') {
    const body = change.body.trim()
    if (!body) return desk
    return withStaff(`${author} wrote: ${body}`, `Reply to ${author}`, {
      messages: [...desk.messages, { id: hubId('msg'), lead_id: leadId, author_name: author, role: 'client', body, created_at: now }],
    })
  }
  if (change.type === 'document') {
    const name = change.name.trim()
    if (!name) return desk
    const body = `Uploaded ${name}.`
    return withStaff(body, `Review ${author}'s upload`, {
      documents: [...desk.documents, { id: hubId('doc'), lead_id: leadId, name, kind: change.kind, uploaded_by: author, created_at: now }],
    })
  }
  if (change.type === 'sign') {
    const name = change.name.trim()
    if (!name) return desk
    const existing = desk.contracts.find((item) => item.lead_id === leadId)
    if (existing?.status === 'signed') return desk
    const contract: Contract = {
      id: existing?.id || hubId('con'),
      lead_id: leadId,
      proposal_id: existing?.proposal_id || null,
      status: 'signed',
      signed_at: now,
    }
    return withStaff(`${name} signed the contract.`, 'File the signed contract', {
      contracts: existing
        ? desk.contracts.map((item) => item.lead_id === leadId ? contract : item)
        : [...desk.contracts, contract],
    })
  }
  const shared = desk.tasks.find((item) => item.id === change.taskId && item.audience === 'client')
  if (!shared || shared.status === 'completed') return desk
  const body = `Completed “${shared.title}”.`
  return withStaff(body, `Client finished: ${shared.title}`, {
    tasks: desk.tasks.map((item) => item.id === shared.id ? { ...item, status: 'completed' } : item),
  })
}

export function contactName(desk: DeskWorkspace, contactId: string) {
  return desk.contacts.find((contact) => contact.id === contactId)?.name || 'Contact'
}

export type CartFilter = 'all' | 'has_cart' | 'open' | 'abandoned' | 'checked_out' | 'none'

export function leadCartStatus(desk: DeskWorkspace, leadId: string, now = Date.now(), abandonDays = 3): Exclude<CartFilter, 'all' | 'has_cart'> | 'empty' {
  const cart = desk.carts?.find((item) => item.lead_id === leadId)
  if (!cart) return 'none'
  if (cart.checked_out_at) return 'checked_out'
  if (cart.item_count === 0) return 'empty'
  return now - new Date(cart.updated_at).getTime() > abandonDays * 86_400_000 ? 'abandoned' : 'open'
}

export function filterLeads(desk: DeskWorkspace, view: Pick<SavedView, 'stage' | 'source' | 'owner' | 'query'> & { cart?: CartFilter; abandonDays?: number }) {
  const query = view.query.trim().toLowerCase()
  return desk.leads.filter((lead) => {
    if (view.cart && view.cart !== 'all') {
      const status = leadCartStatus(desk, lead.id, Date.now(), view.abandonDays ?? 3)
      if (view.cart === 'has_cart' ? status === 'none' || status === 'empty' : status !== view.cart) return false
    }
    if (view.stage !== 'all' && lead.stage !== view.stage) return false
    if (view.source !== 'all' && lead.source !== view.source) return false
    if (view.owner !== 'all' && lead.owner_name !== view.owner) return false
    if (!query) return true
    const contact = desk.contacts.find((item) => item.id === lead.contact_id)
    const company = desk.companies.find((item) => item.id === lead.company_id)
    const haystack = [contact?.name, contact?.email, company?.name, lead.venue_name, lead.event_type, lead.source].join(' ').toLowerCase()
    return haystack.includes(query)
  })
}
