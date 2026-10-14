import { createClient } from '@/lib/supabase/server'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { VenueCrm } from '@/components/admin/venue/venue-crm'
import { SAMPLE_DAYS, SAMPLE_LEADS, type LeadStage, type VenueDay, type VenueLeadRecord } from '@/lib/venues/crm'

export const dynamic = 'force-dynamic'

export default async function VenueAdminPage() {
  let leads = SAMPLE_LEADS
  let days = SAMPLE_DAYS
  let live = false

  try {
    const supabase = await createClient()
    const [leadRes, noteRes, tourRes, bookingRes, dayRes] = await Promise.all([
      supabase.from('venue_leads').select('*').order('created_at', { ascending: false }),
      supabase.from('venue_notes').select('*').order('created_at', { ascending: true }),
      supabase.from('venue_tours').select('*').order('starts_at', { ascending: true }),
      supabase.from('venue_bookings').select('*').order('starts_on', { ascending: true }),
      supabase.from('venue_availability').select('*').order('day', { ascending: true }),
    ])
    if (!leadRes.error && leadRes.data) {
      live = true
      const notes = noteRes.data ?? []
      const tours = tourRes.data ?? []
      const bookings = bookingRes.data ?? []
      leads = leadRes.data.map((lead) => ({
        id: lead.id,
        venue_id: lead.venue_id,
        venue_name: lead.venue_name,
        contact_name: lead.contact_name,
        contact_email: lead.contact_email,
        contact_phone: lead.contact_phone,
        event_date: lead.event_date,
        guest_count: lead.guest_count,
        stage: (lead.stage || 'new') as LeadStage,
        source: lead.source,
        notes: notes.filter((note) => note.lead_id === lead.id),
        tours: tours.filter((tour) => tour.lead_id === lead.id),
        bookings: bookings.filter((booking) => booking.lead_id === lead.id),
      })) as VenueLeadRecord[]
      days = (dayRes.data ?? []) as VenueDay[]
    }
  } catch {
    live = false
  }

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Venue suite"
        title="Venue desk"
        description="Leads, tours, bookings, notes, and which days the rooms are open."
      />
      <VenueCrm leads={leads} days={days} live={live} />
    </AdminPage>
  )
}
