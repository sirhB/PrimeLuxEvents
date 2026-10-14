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

export const LEAD_SOURCES = ['website', 'phone', 'planner', 'referral', 'event_plan', 'venue_page'] as const
export type LeadSource = (typeof LEAD_SOURCES)[number]

export const OPEN_STAGES: PipelineStage[] = ['inquiry', 'tour', 'proposal', 'contract', 'deposit', 'booked']

export type CheckItem = { id: string; label: string; done: boolean }

export type Company = { id: string; name: string; phone: string | null; website: string | null }
export type Contact = { id: string; company_id: string | null; name: string; email: string; phone: string | null; title: string | null }

export type Activity = {
  id: string
  lead_id: string
  kind: 'note' | 'call' | 'email' | 'stage'
  body: string
  author_name: string
  created_at: string
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
}

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
}

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
    },
  ]
  return {
    companies,
    contacts,
    leads,
    activities: [
      { id: 'act1', lead_id: 'lead-avery', kind: 'email', body: 'Sent the Conservatory lookbook and November dates.', author_name: 'Mara Quinn', created_at: `${isoOffset(-3, now)}T15:00:00Z` },
      { id: 'act2', lead_id: 'lead-avery', kind: 'call', body: 'Spoke for twelve minutes. They want a ceremony and a seated dinner.', author_name: 'Mara Quinn', created_at: `${isoOffset(-1, now)}T18:10:00Z` },
      { id: 'act3', lead_id: 'lead-avery', kind: 'note', body: 'Asked for a late-afternoon ceremony.', author_name: 'Mara Quinn', created_at: `${today}T14:00:00Z` },
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
  }
}

export function contactName(desk: DeskWorkspace, contactId: string) {
  return desk.contacts.find((contact) => contact.id === contactId)?.name || 'Contact'
}

export function filterLeads(desk: DeskWorkspace, view: Pick<SavedView, 'stage' | 'source' | 'owner' | 'query'>) {
  const query = view.query.trim().toLowerCase()
  return desk.leads.filter((lead) => {
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
