import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardContent } from '@/components/admin/dashboard/dashboard-content'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Today"
        title="Ops Today"
        description="What needs attention now, weekend readiness, and today’s warehouse work."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-10 border-[var(--dashboard-border)] bg-transparent">
              <Link href="/admin/week-prep">Week Prep</Link>
            </Button>
            <Button
              asChild
              className="h-10 bg-[var(--dashboard-accent-gold)] text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90"
            >
              <Link href="/admin/orders/new">
                <Plus className="mr-2 h-4 w-4" />
                New order
              </Link>
            </Button>
          </div>
        }
      />
      <DashboardContent />
    </AdminPage>
  )
}
