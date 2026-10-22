import { AdminPage, AdminPageHeader } from '@/components/admin/page-shell'
import { CartList } from '@/components/admin/carts/cart-list'
import { requireAuth } from '@/lib/auth/authorization'
import { loadCartList, loadCartableEvents } from '@/lib/carts/load'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CartsPage() {
  await requireAuth()
  const db = await createClient()
  const [{ data: isAdmin }, carts, events] = await Promise.all([db.rpc('is_admin'), loadCartList(), loadCartableEvents()])
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Me" title="Client carts" description="Build a cart for a client's event from the catalog, share the quote, and collect payment." />
      <CartList carts={carts} events={events} showPlanner={Boolean(isAdmin)} />
    </AdminPage>
  )
}
