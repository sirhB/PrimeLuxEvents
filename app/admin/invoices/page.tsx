import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { InvoicesDashboard } from '@/components/invoices/invoices-dashboard'
import { BrandingForm } from '@/components/invoices/branding-form'
import { requireAuth } from '@/lib/auth/authorization'
import { loadClientList, loadInvoiceList } from '@/lib/invoices/load'
import { memberActiveFor } from '@/lib/carts/load'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  await requireAuth()
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  const [{ data: isAdmin }, invoices, clients, member, { data: acct }] = await Promise.all([
    db.rpc('is_admin'), loadInvoiceList(), loadClientList(), memberActiveFor(user?.id ?? ''),
    createServiceRoleClient().from('planner_connect_accounts').select('business_name').eq('planner_user_id', user?.id ?? '').maybeSingle(),
  ])
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Me" title="Invoices" description="Bill clients for Prime Lux rentals and your own services. Stripe emails the invoice and pays you out." />
      <div className="flex flex-col gap-5">
        {member.active && <BrandingForm businessName={acct?.business_name ?? ''} disabled={false} />}
        <InvoicesDashboard invoices={invoices} clients={clients} canInvoice={member.active} showPlanner={Boolean(isAdmin)} />
      </div>
    </AdminPage>
  )
}
