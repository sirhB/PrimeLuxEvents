import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { MyTasksPanel } from '@/components/admin/tasks/my-tasks-panel'
import { loadVenueDesk } from '@/lib/venues/load-desk'

export const dynamic = 'force-dynamic'

export default async function MyTasksPage() {
  const { desk, live } = await loadVenueDesk()
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Venue suite" title="My tasks" description="Today, overdue, and what the pipeline just assigned." />
      <MyTasksPanel initial={desk} live={live} />
    </AdminPage>
  )
}
