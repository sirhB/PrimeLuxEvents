export const LEAD_STAGES = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'tour', label: 'Tour' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'booked', label: 'Booked' },
  { id: 'lost', label: 'Lost' },
] as const

export type LeadStage = (typeof LEAD_STAGES)[number]['id']

export type VenueNote = { id: string; body: string; author_name: string | null; created_at: string }
export type VenueTour = { id: string; starts_at: string; status: string; venue_id: string | null }
export type VenueBooking = { id: string; starts_on: string; ends_on: string; status: string; venue_id: string | null }
export type VenueDay = { id: string; venue_id: string; day: string; status: string }

export type VenueLeadRecord = {
  id: string
  venue_id: string | null
  venue_name: string | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  event_date: string | null
  guest_count: number | null
  stage: LeadStage
  source: string | null
  notes: VenueNote[]
  tours: VenueTour[]
  bookings: VenueBooking[]
}

export const SAMPLE_LEADS: VenueLeadRecord[] = [
  {
    id: 'sample-avery',
    venue_id: '11111111-1111-4111-8111-111111111111',
    venue_name: 'The Conservatory',
    contact_name: 'Avery Cole',
    contact_email: 'avery.cole@example.com',
    contact_phone: '(203) 555-0148',
    event_date: '2026-11-14',
    guest_count: 140,
    stage: 'tour',
    source: 'sample',
    notes: [{ id: 'n1', body: 'Asked for a late-afternoon ceremony and a seated dinner.', author_name: 'Desk', created_at: '2026-10-12T15:00:00Z' }],
    tours: [{ id: 't1', starts_at: '2026-10-18T18:00:00Z', status: 'scheduled', venue_id: '11111111-1111-4111-8111-111111111111' }],
    bookings: [],
  },
  {
    id: 'sample-jordan',
    venue_id: '22222222-2222-4222-8222-222222222222',
    venue_name: 'The Gallery',
    contact_name: 'Jordan Hale',
    contact_email: 'jordan.hale@example.com',
    contact_phone: '(203) 555-0194',
    event_date: '2026-12-04',
    guest_count: 60,
    stage: 'new',
    source: 'sample',
    notes: [],
    tours: [],
    bookings: [],
  },
  {
    id: 'sample-rene',
    venue_id: '33333333-3333-4333-8333-333333333333',
    venue_name: 'The Garden Court',
    contact_name: 'René Patel',
    contact_email: 'rene.patel@example.com',
    contact_phone: '(475) 555-0112',
    event_date: '2027-05-22',
    guest_count: 110,
    stage: 'proposal',
    source: 'sample',
    notes: [{ id: 'n2', body: 'Wants the terrace for cocktails and the loggia for dinner.', author_name: 'Desk', created_at: '2026-10-10T12:00:00Z' }],
    tours: [],
    bookings: [],
  },
]

export const SAMPLE_DAYS: VenueDay[] = [
  { id: 'd1', venue_id: '11111111-1111-4111-8111-111111111111', day: '2026-11-14', status: 'hold' },
  { id: 'd2', venue_id: '22222222-2222-4222-8222-222222222222', day: '2026-12-04', status: 'open' },
  { id: 'd3', venue_id: '33333333-3333-4333-8333-333333333333', day: '2026-10-18', status: 'booked' },
]
