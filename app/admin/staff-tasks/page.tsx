import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { TeamTasks } from '@/components/admin/tasks/team-tasks'
import { loadVenueDesk } from '@/lib/venues/load-desk'

export const dynamic = 'force-dynamic'

export default async function StaffTasksPage() {
  const { desk, live } = await loadVenueDesk()
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Venue suite" title="Team tasks" description="The board, who is carrying the work, and when it is due." />
      <TeamTasks initial={desk} live={live} />
    </AdminPage>
  )
}
