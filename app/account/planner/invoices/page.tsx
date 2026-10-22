import { InvoicesDashboard } from '@/components/invoices/invoices-dashboard'
import { BrandingForm } from '@/components/invoices/branding-form'
import { requireAuth } from '@/lib/auth/authorization'
import { loadClientList, loadInvoiceList } from '@/lib/invoices/load'
import { memberActiveFor } from '@/lib/carts/load'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { PlannerShell } from '../shell'

export const dynamic = 'force-dynamic'

export default async function PlannerInvoicesPage() {
  const user = await requireAuth()
  const [invoices, clients, member, { data: acct }] = await Promise.all([
    loadInvoiceList(), loadClientList(), memberActiveFor(user.id), // RLS: own rows only
    createServiceRoleClient().from('planner_connect_accounts').select('business_name').eq('planner_user_id', user.id).maybeSingle(),
  ])
  return (
    <PlannerShell title="Invoices" lede="Bill clients for Prime Lux rentals and your own services.">
      {member.active && <BrandingForm businessName={acct?.business_name ?? ''} disabled={false} />}
      <InvoicesDashboard invoices={invoices} clients={clients} canInvoice={member.active} />
    </PlannerShell>
  )
}
