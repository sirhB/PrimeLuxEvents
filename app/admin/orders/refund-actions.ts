'use server'

import { revalidatePath } from 'next/cache'
import type Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { hasPermission } from '@/lib/auth/authorization'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { planConnectRefund, planRefund, stripeReason, validIdempotencyKey } from '@/lib/orders/refund'

export type RefundResult =
  | { success: true; refundId: string; amount: number; status: string; duplicate?: boolean }
  | { success: false; error: string }

/**
 * Refund the rental payment on an order (full or partial).
 * Platform orders refund on the Prime Lux account. Planner-collected orders (payment_method
 * 'stripe_connect_direct') were direct charges on the planner's connected account, so they are
 * refunded there with refund_application_fee: Prime Lux's fee (rental share + platform fee)
 * comes back in proportion. See refundConnectOrder.
 * Idempotent per `idempotencyKey`: retries return the same refund instead of creating a second one.
 */
export async function refundOrderPayment(input: {
  orderId: string
  amountCents?: number | null
  reasonCode: string
  reasonNote: string
  idempotencyKey: string
}): Promise<RefundResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !(await hasPermission('orders.update'))) return { success: false, error: 'Unauthorized' }
    if (!stripe) return { success: false, error: 'Stripe is not configured' }
    if (!validIdempotencyKey(input.idempotencyKey)) return { success: false, error: 'Refresh the page and try again.' }
    const note = String(input.reasonNote || '').trim().slice(0, 500)
    if (!note) return { success: false, error: 'Add a reason for the refund.' }

    const prior = await supabase.from('order_refunds').select('*').eq('idempotency_key', input.idempotencyKey).maybeSingle()
    if (prior.data && prior.data.status !== 'failed' && prior.data.stripe_refund_id) {
      return { success: true, refundId: prior.data.stripe_refund_id, amount: prior.data.amount_cents, status: prior.data.status, duplicate: true }
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, payment_intent_id, payment_method, total_amount, refunded_amount')
      .eq('id', input.orderId)
      .single()
    if (error || !order) return { success: false, error: 'Order not found' }
    if (order.payment_method === 'stripe_connect_direct') {
      return await refundConnectOrder({ supabase, user, order, input, note })
    }
    const paymentIntentId = order.payment_intent_id as string | null
    if (!paymentIntentId || paymentIntentId.startsWith('pi_mock_')) return { success: false, error: 'This order has no Stripe payment to refund.' }

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] })
    const charge = pi.latest_charge as Stripe.Charge | null
    if (!charge || typeof charge === 'string' || !charge.paid) return { success: false, error: 'The payment has not been captured yet.' }

    const plan = planRefund(charge.amount, charge.amount_refunded, input.amountCents ?? null)
    if (!plan.ok) return { success: false, error: plan.error }

    const reasonCode = stripeReason(input.reasonCode)
    const row = {
      order_id: order.id,
      payment_intent_id: paymentIntentId,
      amount_cents: plan.amount,
      reason: note,
      stripe_reason: input.reasonCode.slice(0, 40),
      idempotency_key: input.idempotencyKey,
      status: 'pending',
      created_by: user.id,
      created_by_email: user.email ?? null,
    }
    let refundRowId = prior.data?.id as string | undefined
    if (!refundRowId) {
      const inserted = await supabase.from('order_refunds').insert(row).select('id').single()
      if (inserted.error || !inserted.data) {
        const again = await supabase.from('order_refunds').select('*').eq('idempotency_key', input.idempotencyKey).maybeSingle()
        if (again.data?.stripe_refund_id) return { success: true, refundId: again.data.stripe_refund_id, amount: again.data.amount_cents, status: again.data.status, duplicate: true }
        return { success: false, error: 'Could not record the refund. Nothing was refunded.' }
      }
      refundRowId = inserted.data.id
    }

    let refund: Stripe.Refund
    try {
      refund = await stripe.refunds.create(
        {
          payment_intent: paymentIntentId,
          amount: plan.amount,
          ...(reasonCode ? { reason: reasonCode } : {}),
          metadata: { orderId: order.id, type: 'rental_payment_refund', refundRecordId: refundRowId!, staff: user.email || user.id },
        },
        { idempotencyKey: `order-refund-${input.idempotencyKey}` },
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stripe declined the refund'
      await supabase.from('order_refunds').update({ status: 'failed', error: message.slice(0, 500), updated_at: new Date().toISOString() }).eq('id', refundRowId)
      return { success: false, error: message }
    }

    const status = refund.status === 'succeeded' ? 'succeeded' : refund.status === 'failed' || refund.status === 'canceled' ? refund.status : 'pending'
    await supabase.from('order_refunds').update({ status, stripe_refund_id: refund.id, updated_at: new Date().toISOString() }).eq('id', refundRowId)

    const refundedTotal = charge.amount_refunded + (status === 'failed' || status === 'canceled' ? 0 : plan.amount)
    const update: Record<string, unknown> = { refunded_amount: refundedTotal }
    if (refundedTotal >= charge.amount) update.payment_status = 'refunded'
    await supabase.from('orders').update(update).eq('id', order.id)

    revalidatePath(`/admin/orders/${order.id}`)
    revalidatePath('/admin/orders')
    revalidatePath('/admin/activity')
    return { success: true, refundId: refund.id, amount: plan.amount, status }
  } catch (err) {
    console.error('refundOrderPayment:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Refund failed' }
  }
}

type Db = Awaited<ReturnType<typeof createClient>>

/** Refund a planner-collected order across its paid cart payments on the connected account. */
async function refundConnectOrder(args: {
  supabase: Db
  user: { id: string; email?: string | null }
  order: { id: string; total_amount: number | null }
  input: { amountCents?: number | null; reasonCode: string; idempotencyKey: string }
  note: string
}): Promise<RefundResult> {
  const { supabase, user, order, input, note } = args
  const svc = createServiceRoleClient() // planner tables are admin/planner RLS; staff permission was checked above
  const { data: cart } = await svc.from('planner_carts').select('id').eq('order_id', order.id).maybeSingle()
  if (!cart) return { success: false, error: 'Planner cart for this order was not found.' }
  const { data: rows } = await svc
    .from('planner_cart_payments')
    .select('id, amount_cents, refunded_cents, application_fee_cents, paid_at, stripe_payment_intent_id, stripe_account_id, status')
    .eq('cart_id', cart.id)
    .eq('status', 'paid')
  const pays = (rows ?? []).filter((r) => r.stripe_payment_intent_id && r.stripe_account_id)
  if (!pays.length) return { success: false, error: 'This order has no Stripe payment to refund.' }

  // Stripe is the source of truth for what is already refunded on each charge.
  const s = stripe!
  const fresh = await Promise.all(pays.map(async (p) => {
    const pi = await s.paymentIntents.retrieve(p.stripe_payment_intent_id, { expand: ['latest_charge'] }, { stripeAccount: p.stripe_account_id })
    const ch = pi.latest_charge as Stripe.Charge | null
    return { row: p, refunded: ch && typeof ch !== 'string' ? ch.amount_refunded : Number(p.refunded_cents) }
  }))
  const plan = planConnectRefund(fresh.map((f) => ({
    id: f.row.id, amountCents: Number(f.row.amount_cents), refundedCents: f.refunded,
    applicationFeeCents: Number(f.row.application_fee_cents), paidAt: f.row.paid_at,
  })), input.amountCents ?? null)
  if (!plan.ok) return { success: false, error: plan.error }

  const reasonCode = stripeReason(input.reasonCode)
  let done = 0
  let lastId = ''
  let anyPending = false
  for (const [i, part] of plan.parts.entries()) {
    const p = pays.find((x) => x.id === part.id)!
    const key = `${input.idempotencyKey}-${i}`
    const prior = await supabase.from('order_refunds').select('*').eq('idempotency_key', key).maybeSingle()
    if (prior.data?.stripe_refund_id && prior.data.status !== 'failed') { done += prior.data.amount_cents; lastId = prior.data.stripe_refund_id; continue }
    let rowId = prior.data?.id as string | undefined
    if (!rowId) {
      const ins = await supabase.from('order_refunds').insert({
        order_id: order.id, payment_intent_id: p.stripe_payment_intent_id, amount_cents: part.amount, reason: note,
        stripe_reason: input.reasonCode.slice(0, 40), idempotency_key: key, status: 'pending',
        created_by: user.id, created_by_email: user.email ?? null,
      }).select('id').single()
      if (ins.error || !ins.data) return done ? { success: true, refundId: lastId, amount: done, status: 'partial' } : { success: false, error: 'Could not record the refund. Nothing was refunded.' }
      rowId = ins.data.id
    }
    try {
      const refund = await s.refunds.create({
        payment_intent: p.stripe_payment_intent_id,
        amount: part.amount,
        refund_application_fee: true, // Prime Lux fee returned proportionally
        ...(reasonCode ? { reason: reasonCode } : {}),
        metadata: { orderId: order.id, type: 'planner_order_refund', refundRecordId: rowId!, planner_cart_payment_id: p.id, staff: user.email || user.id },
      }, { stripeAccount: p.stripe_account_id, idempotencyKey: `order-refund-${key}` })
      const status = refund.status === 'succeeded' ? 'succeeded' : refund.status === 'failed' || refund.status === 'canceled' ? refund.status : 'pending'
      await supabase.from('order_refunds').update({ status, stripe_refund_id: refund.id, updated_at: new Date().toISOString() }).eq('id', rowId)
      if (status === 'pending') anyPending = true
      if (status !== 'failed' && status !== 'canceled') done += part.amount
      lastId = refund.id
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stripe declined the refund'
      await supabase.from('order_refunds').update({ status: 'failed', error: message.slice(0, 500), updated_at: new Date().toISOString() }).eq('id', rowId)
      if (!done) return { success: false, error: message }
      break
    }
  }
  // planner_cart_payments.refunded_cents / fee_refunded_cents are set by the Connect charge.refunded webhook.
  const alreadyRefunded = fresh.reduce((sum, f) => sum + f.refunded, 0)
  const refundedTotal = alreadyRefunded + done
  const update: Record<string, unknown> = { refunded_amount: refundedTotal }
  if (refundedTotal >= Number(order.total_amount || 0)) update.payment_status = 'refunded'
  await supabase.from('orders').update(update).eq('id', order.id)
  revalidatePath(`/admin/orders/${order.id}`)
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/carts/${cart.id}`)
  return { success: true, refundId: lastId, amount: done, status: anyPending ? 'pending' : done < plan.amount ? 'partial' : 'succeeded' }
}
