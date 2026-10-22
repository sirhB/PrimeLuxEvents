import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { MyEarnings } from '@/components/admin/commissions/my-earnings'
import { requireAuth } from '@/lib/auth/authorization'
import { loadEarnings } from '@/lib/commissions/load'

export const dynamic = 'force-dynamic'

export default async function MyEarningsPage() {
  const user = await requireAuth()
  const data = await loadEarnings(user.id, user.full_name ?? user.email ?? 'You')
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Me" title="My earnings" description="Commission on your events, payment links for clients, and payouts to your Whop balance." />
      <MyEarnings data={data} />
    </AdminPage>
  )
}
