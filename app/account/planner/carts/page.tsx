import { CartList } from '@/components/admin/carts/cart-list'
import { requireAuth } from '@/lib/auth/authorization'
import { loadCartList, loadCartableEvents } from '@/lib/carts/load'
import { PlannerShell } from '../shell'

export const dynamic = 'force-dynamic'

export default async function PlannerCartsPage() {
  await requireAuth()
  const [carts, events] = await Promise.all([loadCartList(), loadCartableEvents()]) // RLS: own carts
  return (
    <PlannerShell title="Client carts" lede="Build a cart for a client's event, share the quote, and collect payment.">
      <CartList carts={carts} events={events} base="/account/planner/carts" />
    </PlannerShell>
  )
}
