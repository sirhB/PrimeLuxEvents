import { createClient } from '@/lib/supabase/server'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { EventPlansTable, type EventPlanRow } from '@/components/admin/venue/event-plans-table'

export const dynamic = 'force-dynamic'

const SAMPLE: EventPlanRow[] = [
  {
    id: 'sample-plan',
    event_type: 'Wedding',
    event_date: '2026-11-14',
    guest_count: 140,
    venue_name: 'Prime Lux Pavilion',
    services: ['Planning', 'Florals'],
    rentals: ['Seating', 'Lighting'],
    budget_range: '$15,000–$30,000',
    contact_name: 'Avery Cole',
    contact_email: 'avery.cole@example.com',
    contact_phone: '(203) 555-0148',
    status: 'new',
    created_at: '2026-10-14T12:00:00Z',
  },
]

export default async function EventPlansPage() {
  let plans = SAMPLE
  let live = false
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('event_plans').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      live = true
      plans = data as EventPlanRow[]
    }
  } catch {
    live = false
  }

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Inquiries"
        title="Event plans"
        description="Every plan submitted from the public form, with the occasion, date, guests, venue, services, rentals, and budget."
      />
      <EventPlansTable plans={plans} live={live} />
    </AdminPage>
  )
}
