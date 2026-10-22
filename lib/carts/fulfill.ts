import type { SupabaseClient } from '@supabase/supabase-js'

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** Cart payment link checkout completed on the planner's connected account (Connect webhook). */
export async function recordCartPayment(db: SupabaseClient, input: { paymentId?: string; cartId?: string; sessionId: string; paymentIntentId: string | null }) {
  if (!input.paymentId || !input.cartId) return
  await db.from('planner_cart_payments').update({
    status: 'paid', paid_at: new Date().toISOString(), stripe_checkout_session_id: input.sessionId, stripe_payment_intent_id: input.paymentIntentId,
  }).eq('id', input.paymentId).eq('cart_id', input.cartId).neq('status', 'paid')
  await refreshCartAfterPayment(db, input.cartId)
}

/**
 * Refresh paid_cents (net of refunds). When an approved cart is paid in full it becomes the event's order
 * (one per cart: the status flip is claimed atomically).
 */
export async function refreshCartAfterPayment(db: SupabaseClient, cartId: string) {
  const [{ data: cart }, { data: pays }] = await Promise.all([
    db.from('planner_carts').select('*, venue_leads(contact_name, contact_email, contact_phone, event_date, venue_name)').eq('id', cartId).maybeSingle(),
    db.from('planner_cart_payments').select('amount_cents, refunded_cents').eq('cart_id', cartId).eq('status', 'paid'),
  ])
  if (!cart) return { ordered: false }
  const paid = ((pays ?? []) as Row[]).reduce((s, p) => s + Number(p.amount_cents) - Number(p.refunded_cents ?? 0), 0)
  await db.from('planner_carts').update({ paid_cents: paid, updated_at: new Date().toISOString() }).eq('id', cartId)
  const fullyPaid = Number(cart.total_cents) > 0 && paid >= Number(cart.total_cents)
  if (!fullyPaid || cart.order_id || cart.status !== 'approved') return { ordered: false }

  const { data: claimed } = await db.from('planner_carts').update({ status: 'paid' })
    .eq('id', cartId).eq('status', 'approved').is('order_id', null).select('id')
  if (!claimed?.length) return { ordered: false }

  const lead = (cart.venue_leads ?? {}) as Row
  const { data: order, error } = await db.from('orders').insert({
    customer_name: lead.contact_name || 'Client',
    customer_email: lead.contact_email || 'unknown@example.com',
    customer_phone: lead.contact_phone ?? null,
    total_amount: Number(cart.total_cents),
    subtotal: Number(cart.subtotal_cents),
    tax_rate: Number(cart.tax_rate),
    tax_amount: Number(cart.tax_cents),
    delivery_fee: Number(cart.delivery_fee_cents),
    setup_fee: Number(cart.setup_fee_cents),
    status: 'confirmed',
    payment_status: 'succeeded',
    payment_method: 'stripe_connect_direct',
    delivery_date: lead.event_date ?? null,
    delivery_address: lead.venue_name ?? null,
    notes: `Planner cart ${cart.id} · ${cart.title}`,
  }).select('id').single()
  if (error || !order) return { ordered: false }

  const { data: lines } = await db.from('planner_cart_lines').select('product_id, quantity, client_unit_cents, discount_bps').eq('cart_id', cartId).eq('item_type', 'product')
  const items = ((lines ?? []) as Row[]).filter((l) => l.product_id).map((l) => ({
    order_id: order.id, product_id: l.product_id, quantity: l.quantity,
    price_at_time: Math.round(Number(l.client_unit_cents) * (1 - l.discount_bps / 10000)),
  }))
  if (items.length) await db.from('order_items').insert(items)
  await db.from('planner_carts').update({ status: 'ordered', order_id: order.id }).eq('id', cartId)
  return { ordered: true }
}
