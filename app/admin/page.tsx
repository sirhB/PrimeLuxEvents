import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardContent } from '@/components/admin/dashboard/dashboard-content'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { createClient } from '@/lib/supabase/server'
import { getUserStaffRoles } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const roles = await getUserStaffRoles(user.id)
    const isStaffOnly =
      roles.includes('staff') && !roles.includes('admin') && !roles.includes('manager')
    if (isStaffOnly) {
      redirect('/admin/warehouse/schedule')
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Today"
        title="Ops Today"
        description="Exceptions that need a decision, plus weekend readiness. Deep work lives in Week Prep."
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
