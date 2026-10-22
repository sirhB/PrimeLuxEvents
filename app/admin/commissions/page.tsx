import { redirect } from 'next/navigation'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { CommissionLedger } from '@/components/admin/commissions/commission-ledger'
import { loadLedger } from '@/lib/commissions/load'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CommissionsPage() {
  const db = await createClient()
  const { data: isAdmin } = await db.rpc('is_admin')
  if (!isAdmin) redirect('/admin/my-earnings')
  const data = await loadLedger()
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Money" title="Commissions" description="What planners have earned, what's waiting on payment, and what's been paid out through Whop." />
      <CommissionLedger data={data} />
    </AdminPage>
  )
}
