import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { VenueCrm } from '@/components/admin/venue/venue-crm'
import { createClient } from '@/lib/supabase/server'
import type { VenueDay } from '@/lib/venues/crm'

export const dynamic = 'force-dynamic'

export default async function VenueAvailabilityPage() {
  let days: VenueDay[] = []
  let bookings: Array<{ id: string; venue_id: string | null; starts_on: string; ends_on: string; status: string }> = []
  let live = false
  try {
    const supabase = await createClient()
    const from = new Date()
    from.setMonth(from.getMonth() - 1)
    const since = from.toISOString().slice(0, 10)
    const [availability, holds] = await Promise.all([
      supabase.from('venue_availability').select('id, venue_id, day, status').gte('day', since),
      supabase.from('venue_bookings').select('id, venue_id, starts_on, ends_on, status').gte('ends_on', since),
    ])
    if (!availability.error) {
      live = true
      days = (availability.data || []).map((row) => ({ id: row.id, venue_id: row.venue_id, day: row.day, status: row.status }))
    }
    bookings = holds.data || []
  } catch {
    live = false
  }
  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Venue suite"
        title="Pavilion availability"
        description="Block or open dates for the Pavilion. Holds and confirmed bookings from the venue desk appear here and on the public venue pages."
      />
      <VenueCrm leads={[]} days={days} bookings={bookings} live={live} mode="availability" />
    </AdminPage>
  )
}
