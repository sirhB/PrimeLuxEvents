import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireStripe } from '@/lib/stripe'
import { recordCartPayment, refreshCartAfterPayment } from '@/lib/carts/fulfill'
import { syncConnectAccount } from './server'

type Db = SupabaseClient
const idOf = (v: unknown): string | null => (typeof v === 'string' ? v : (v as { id?: string } | null)?.id ?? null)

/**
 * Events from connected (planner Express) accounts, delivered to the Connect endpoint
 * (/api/stripe/connect-webhook, STRIPE_CONNECT_WEBHOOK_SECRET). event.account = acct_...
 * Idempotent per event id via planner_stripe_events.
 */
export async function handleConnectEvent(event: Stripe.Event, db: Db): Promise<void> {
  const run = route(event, db)
  if (!run) return
  const { error: claim } = await db.from('planner_stripe_events').insert({ stripe_event_id: event.id, event_type: event.type })
  if (claim) {
    if (claim.code !== '23505') throw new Error('Could not record event')
    const { data: prior } = await db.from('planner_stripe_events').select('status').eq('stripe_event_id', event.id).maybeSingle()
    if (prior?.status !== 'failed') return
    await db.from('planner_stripe_events').update({ status: 'processing', error: null }).eq('stripe_event_id', event.id)
  }
  try {
    await run()
    await db.from('planner_stripe_events').update({ status: 'processed' }).eq('stripe_event_id', event.id)
  } catch (e) {
    await db.from('planner_stripe_events').update({ status: 'failed', error: (e as Error).message.slice(0, 500) }).eq('stripe_event_id', event.id)
    throw e
  }
}

function route(event: Stripe.Event, db: Db): null | (() => Promise<void>) {
  const account = event.account ?? null
  switch (event.type) {
    case 'account.updated':
      return () => syncConnectAccount(db, event.data.object)
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const s = event.data.object
      if (s.metadata?.paymentType !== 'planner_cart' || !account) return null
      return async () => {
        if (s.payment_status !== 'paid') return
        const pi = idOf(s.payment_intent)
        await recordCartPayment(db, { paymentId: s.metadata!.planner_cart_payment_id, cartId: s.metadata!.planner_cart_id, sessionId: s.id, paymentIntentId: pi })
        if (pi) await recordStripeFee(db, account, pi, s.metadata!.planner_cart_payment_id)
      }
    }
    case 'charge.refunded': {
      const ch = event.data.object
      if (!account) return null
      return async () => {
        const p = await paymentByIntent(db, idOf(ch.payment_intent))
        if (!p) return
        // Fee actually refunded to the platform's application fee (pulled from Stripe, not guessed).
        let feeRefunded = Number(p.fee_refunded_cents)
        const feeId = idOf(ch.application_fee)
        if (feeId) feeRefunded = (await requireStripe().applicationFees.retrieve(feeId)).amount_refunded
        await db.from('planner_cart_payments').update({ refunded_cents: ch.amount_refunded, fee_refunded_cents: feeRefunded, stripe_charge_id: ch.id }).eq('id', p.id)
        await refreshCartAfterPayment(db, p.cart_id)
      }
    }
    case 'charge.dispute.created':
    case 'charge.dispute.updated':
    case 'charge.dispute.closed': {
      const d = event.data.object
      if (!account) return null
      return async () => {
        const p = await paymentByIntent(db, idOf(d.payment_intent))
        if (!p) return
        const status = event.type !== 'charge.dispute.closed' ? 'open' : d.status === 'won' ? 'won' : 'lost'
        // The planner (merchant of record) responds to disputes in their Express dashboard.
        // A lost dispute is debited from the planner's account; the application fee is not auto-returned.
        await db.from('planner_cart_payments').update({ dispute_status: status }).eq('id', p.id)
      }
    }
    default:
      return null
  }
}

async function paymentByIntent(db: Db, pi: string | null) {
  if (!pi) return null
  const { data } = await db.from('planner_cart_payments').select('id, cart_id, fee_refunded_cents').eq('stripe_payment_intent_id', pi).maybeSingle()
  return data
}

/** Stripe's processing fee on the direct charge (comes out of the planner's balance). */
async function recordStripeFee(db: Db, account: string, pi: string, paymentId?: string) {
  if (!paymentId) return
  const intent = await requireStripe().paymentIntents.retrieve(pi, { expand: ['latest_charge.balance_transaction'] }, { stripeAccount: account })
  const ch = intent.latest_charge as Stripe.Charge | null
  const bt = ch?.balance_transaction as Stripe.BalanceTransaction | null
  if (!ch) return
  // balance_transaction.fee includes the application fee on direct charges; subtract it.
  const appFee = (bt?.fee_details ?? []).filter((f) => f.type === 'application_fee').reduce((a, f) => a + f.amount, 0)
  const stripeFee = bt ? bt.fee - appFee : null
  await db.from('planner_cart_payments').update({ stripe_charge_id: ch.id, stripe_fee_cents: stripeFee }).eq('id', paymentId)
}
