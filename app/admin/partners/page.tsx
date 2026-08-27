import { requirePermission } from '@/lib/auth/authorization'
import { createServiceClient } from '@/lib/supabase/server'
import { PartnersAdminContent } from '@/components/admin/partners/partners-content'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminPartnersPage() {
  await requirePermission('customers.view')
  const admin = createServiceClient()
  const { data: partners, error } = await admin
    .from('partner_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    const missingTable =
      error.message?.includes('partner_profiles') ||
      error.code === '42P01' ||
      error.message?.toLowerCase().includes('does not exist')

    return (
      <AdminPage>
        <AdminPageHeader
          title="Preferred partners"
          description="Approve planners and decorators for trade rates and client share carts."
          eyebrow="CRM"
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Partners' },
          ]}
        />
        <div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-6 space-y-3">
          <p className="text-sm text-[var(--dashboard-text)]">
            {missingTable
              ? 'The partner tables are not in this database yet. Apply the Supabase migrations 20260828_partner_portal.sql and 20260828_partner_branding.sql, then refresh.'
              : `Could not load partners: ${error.message}`}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Back to dashboard</Link>
          </Button>
        </div>
      </AdminPage>
    )
  }

  return <PartnersAdminContent partners={(partners as any[]) || []} />
}
