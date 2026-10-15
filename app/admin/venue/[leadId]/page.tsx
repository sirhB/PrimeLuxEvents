import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { LeadFile } from '@/components/admin/venue/lead-file'
import { loadVenueDesk } from '@/lib/venues/load-desk'

export const dynamic = 'force-dynamic'

export default async function VenueLeadPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params
  const { desk, live } = await loadVenueDesk()
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Venue suite" title="Lead" description="The file, the quote, and the work it creates." />
      <LeadFile initial={desk} live={live} leadId={leadId} backHref="/admin/venue" />
    </AdminPage>
  )
}
