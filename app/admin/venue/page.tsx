import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { CrmDesk } from '@/components/admin/venue/crm-desk'
import { loadVenueDesk } from '@/lib/venues/load-desk'

export const dynamic = 'force-dynamic'

export default async function VenueAdminPage() {
  const { desk, live } = await loadVenueDesk()
  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Venue suite"
        title="Venue desk"
        description="Contacts, pipeline, calendar, proposals, and the tasks each stage creates."
      />
      <CrmDesk initial={desk} live={live} leadBase="/admin/venue" />
    </AdminPage>
  )
}
