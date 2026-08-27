import { requirePermission } from '@/lib/auth/authorization'
import { createServiceClient } from '@/lib/supabase/server'
import { PartnersAdminContent } from '@/components/admin/partners/partners-content'

export default async function AdminPartnersPage() {
  await requirePermission('customers.view')
  const admin = createServiceClient()
  const { data: partners } = await admin
    .from('partner_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return <PartnersAdminContent partners={(partners as any[]) || []} />
}
