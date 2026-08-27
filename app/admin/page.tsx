import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardContent } from '@/components/admin/dashboard/dashboard-content'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Today"
        title="Dashboard"
        description="Orders, leads, and warehouse movement at a glance."
        actions={
          <Link href="/admin/orders/new">
            <Button className="h-10 rounded-md bg-[var(--dashboard-accent-gold)] px-4 text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90">
              <Plus className="mr-2 h-4 w-4" />
              New order
            </Button>
          </Link>
        }
      />
      <DashboardContent />
    </AdminPage>
  )
}
