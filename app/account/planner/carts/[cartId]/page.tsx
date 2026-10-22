import { notFound } from 'next/navigation'
import { PlannerCart } from '@/components/admin/carts/planner-cart'
import { requireAuth } from '@/lib/auth/authorization'
import { loadCart, loadPlannerContext } from '@/lib/carts/load'
import { PlannerShell } from '../../shell'

export const dynamic = 'force-dynamic'

export default async function PlannerCartPage({ params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params
  const user = await requireAuth()
  const cart = await loadCart(cartId) // RLS: own carts only
  if (!cart) notFound()
  const ctx = await loadPlannerContext(user.id)
  return (
    <PlannerShell title={cart.title}>
      <PlannerCart cart={cart} ctx={ctx} />
    </PlannerShell>
  )
}
