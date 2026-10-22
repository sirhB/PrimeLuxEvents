import { notFound } from 'next/navigation'
import { AdminPage } from '@/components/admin/page-shell'
import { PlannerCart } from '@/components/admin/carts/planner-cart'
import { requireAuth } from '@/lib/auth/authorization'
import { loadCart, loadPlannerContext } from '@/lib/carts/load'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CartPage({ params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params
  await requireAuth()
  const cart = await loadCart(cartId) // RLS: own carts for planners, all for admins
  if (!cart) notFound()
  const db = await createClient()
  const { data: row } = await db.from('planner_carts').select('planner_user_id').eq('id', cartId).maybeSingle()
  const ctx = await loadPlannerContext(row?.planner_user_id ?? '')
  return (
    <AdminPage>
      <PlannerCart cart={cart} ctx={ctx} />
    </AdminPage>
  )
}
