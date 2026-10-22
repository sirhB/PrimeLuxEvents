import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { LeadFile } from '@/components/admin/venue/lead-file'
import { loadVenueDesk } from '@/lib/venues/load-desk'
import { EventCarts } from '@/components/admin/carts/event-carts'
import { loadCartList } from '@/lib/carts/load'

export const dynamic = 'force-dynamic'

export default async function VenueLeadPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params
  const [{ desk, live }, carts] = await Promise.all([loadVenueDesk(), loadCartList().catch(() => [])])
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Venue suite" title="Lead" description="The file, the quote, and the work it creates." />
      <LeadFile initial={desk} live={live} leadId={leadId} backHref="/admin/venue" />
      <EventCarts carts={carts.filter((c) => c.leadId === leadId)} />
    </AdminPage>
  )
}
