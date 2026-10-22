import { redirect } from 'next/navigation'
import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { MembersDesk } from '@/components/admin/members/members-desk'
import { loadMembersDesk } from '@/lib/membership/admin-load'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const db = await createClient()
  const { data: isAdmin } = await db.rpc('is_admin')
  if (!isAdmin) redirect('/unauthorized')
  const data = await loadMembersDesk()
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Planners" title="Planner members" description="Memberships, what Prime Lux owes planners, and which rentals get the member price." />
      <MembersDesk data={data} />
    </AdminPage>
  )
}
