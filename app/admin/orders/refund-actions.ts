'use server'

import { revalidatePath } from 'next/cache'
import type Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { hasPermission } from '@/lib/auth/authorization'
import { planRefund, stripeReason, validIdempotencyKey } from '@/lib/orders/refund'

export type RefundResult =
  | { success: true; refundId: string; amount: number; status: string; duplicate?: boolean }
  | { success: false; error: string }

/**
 * Refund the rental payment on an order (full or partial).
 * Platform charges only: Stripe Connect is not on main, so refunds run on the Prime Lux account.
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
      .select('id, payment_intent_id, total_amount, refunded_amount')
      .eq('id', input.orderId)
      .single()
    if (error || !order) return { success: false, error: 'Order not found' }
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
