import { DashboardContent } from '@/components/admin/dashboard/dashboard-content'
import { AdminPage } from '@/components/admin/page-shell'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  return (
    <AdminPage>
      <DashboardContent />
    </AdminPage>
  )
}
