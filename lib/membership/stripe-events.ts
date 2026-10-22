import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireStripe } from '@/lib/stripe'
import { nextMembershipState, type MembershipEvent, type MembershipStatus } from './policy'
import { banPlanner } from './server'

type Db = SupabaseClient
type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Planner membership events, called from the existing Stripe webhook
 * (same endpoint, same STRIPE_WEBHOOK_SECRET). Cart payments are direct charges on
 * planners' connected accounts and arrive on the Connect webhook instead (lib/connect/events.ts). Returns true when the event was ours and
 * handled, so the existing order logic never sees it. Idempotent per Stripe event id.
 */
export async function handlePlannerStripeEvent(event: Stripe.Event, db: Db): Promise<boolean> {
  const ours = await classify(event, db)
  if (!ours) return false

  const { error: claim } = await db.from('planner_stripe_events').insert({ stripe_event_id: event.id, event_type: event.type })
  if (claim) {
    if (claim.code !== '23505') throw new Error('Could not record event')
    const { data: prior } = await db.from('planner_stripe_events').select('status').eq('stripe_event_id', event.id).maybeSingle()
    if (prior?.status !== 'failed') return true
    await db.from('planner_stripe_events').update({ status: 'processing', error: null }).eq('stripe_event_id', event.id)
  }
  try {
    await ours()
    await db.from('planner_stripe_events').update({ status: 'processed' }).eq('stripe_event_id', event.id)
    return true
  } catch (e) {
    await db.from('planner_stripe_events').update({ status: 'failed', error: (e as Error).message.slice(0, 500) }).eq('stripe_event_id', event.id)
    throw e
  }
}

async function membershipBy(db: Db, sub?: string | null, customer?: string | null): Promise<Row | null> {
  if (sub) {
    const { data } = await db.from('planner_memberships').select('*').eq('stripe_subscription_id', sub).maybeSingle()
    if (data) return data
  }
  if (customer) {
    const { data } = await db.from('planner_memberships').select('*').eq('stripe_customer_id', customer).maybeSingle()
    if (data) return data
  }
  return null
}

const idOf = (v: unknown): string | null => (typeof v === 'string' ? v : (v as { id?: string } | null)?.id ?? null)

async function apply(db: Db, m: Row, ev: MembershipEvent, extra: Row = {}): Promise<MembershipStatus> {
  const t = nextMembershipState(m.status as MembershipStatus, ev)
  if (t.ban) {
    // Retries exhausted but Stripe kept the subscription ("unpaid"): cancel it too.
    if (m.stripe_subscription_id && ev.type === 'customer.subscription.updated') {
      await requireStripe().subscriptions.cancel(m.stripe_subscription_id, { prorate: false, invoice_now: false }).catch(() => {})
    }
    await banPlanner(db, { userId: m.planner_user_id, reason: t.ban, customerId: m.stripe_customer_id })
    return 'terminated'
  }
  await db.from('planner_memberships').update({ status: t.status, updated_at: new Date().toISOString(), ...extra }).eq('planner_user_id', m.planner_user_id)
  return t.status
}

/** Open membership invoices for this planner's customer (the past-due balance). */
async function openMembershipInvoices(m: Row): Promise<Stripe.Invoice[]> {
  if (!m.stripe_customer_id) return []
  const list = await requireStripe().invoices.list({ customer: m.stripe_customer_id, status: 'open', limit: 100 })
  return list.data.filter((i) => !m.stripe_subscription_id || idOf(i.parent?.subscription_details?.subscription) === m.stripe_subscription_id)
}

async function refreshBalance(db: Db, m: Row): Promise<{ open: number }> {
  const open = await openMembershipInvoices(m)
  const oldest = [...open].sort((a, b) => a.created - b.created)[0]
  await db.from('planner_memberships').update({
    balance_due_cents: open.reduce((a, i) => a + (i.amount_remaining ?? 0), 0),
    balance_due_url: oldest?.hosted_invoice_url ?? null, updated_at: new Date().toISOString(),
  }).eq('planner_user_id', m.planner_user_id)
  return { open: open.length }
}

/**
 * Stripe sets auto_advance=false on a canceled subscription's open invoices, which stops
 * retries and reminders. Turn it back on so the past-due balance stays collectible and
 * Stripe keeps retrying per the Dashboard retry schedule.
 */
async function keepBalanceCollectible(db: Db, m: Row) {
  const open = await openMembershipInvoices(m)
  for (const i of open) await requireStripe().invoices.update(i.id, { auto_advance: true }).catch(() => {})
  const bal = await refreshBalance(db, m)
  // Nothing actually owed (e.g. paid in the meantime): settle immediately -> ban.
  if (bal.open === 0) await apply(db, { ...m, status: 'balance_due' }, { type: 'balance.invoice_paid', openRemaining: 0 })
}

/** Returns a handler when the event belongs to planner membership/carts, else null. */
async function classify(event: Stripe.Event, db: Db): Promise<null | (() => Promise<void>)> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object
      if (s.metadata?.kind === 'planner_membership' && s.mode === 'subscription') {
        return async () => {
          const m = await membershipBy(db, null, idOf(s.customer))
          if (!m) return
          await db.from('planner_memberships').update({ stripe_subscription_id: idOf(s.subscription), updated_at: new Date().toISOString() }).eq('planner_user_id', m.planner_user_id)
        }
      }
      return null
    }
    case 'invoice.paid':
    case 'invoice.payment_failed':
    case 'invoice.marked_uncollectible':
    case 'invoice.voided': {
      const inv = event.data.object
      const sub = idOf(inv.parent?.subscription_details?.subscription)
      const m = await membershipBy(db, sub, idOf(inv.customer))
      if (!m) return null
      return async () => {
        if (m.status === 'balance_due') {
          // Canceled while past due: settle or end collection -> permanent ban either way.
          const ended = event.type === 'invoice.marked_uncollectible' || event.type === 'invoice.voided'
            || (event.type === 'invoice.payment_failed' && inv.next_payment_attempt == null)
          if (event.type === 'invoice.paid') {
            const bal = await refreshBalance(db, m)
            await apply(db, m, { type: 'balance.invoice_paid', openRemaining: bal.open })
          } else if (ended) {
            await apply(db, m, { type: 'balance.collection_ended' })
          } else {
            await refreshBalance(db, m)
          }
          return
        }
        if (event.type === 'invoice.marked_uncollectible' || event.type === 'invoice.voided') return
        const line = inv.lines?.data?.[0]
        await apply(db, m, { type: event.type }, event.type === 'invoice.paid' && line?.period?.end
          ? { current_period_end: new Date(line.period.end * 1000).toISOString(), stripe_subscription_id: sub ?? m.stripe_subscription_id }
          : {})
      }
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const m = await membershipBy(db, sub.id, idOf(sub.customer))
      if (!m && sub.metadata?.kind !== 'planner_membership') return null
      if (!m) return async () => {}
      return async () => {
        if (event.type === 'customer.subscription.updated') {
          await apply(db, m, { type: event.type, stripeStatus: sub.status }, { stripe_subscription_id: sub.id })
        } else {
          const t = await apply(db, m, { type: event.type, cancellationReason: sub.cancellation_details?.reason ?? null })
          if (t === 'balance_due') await keepBalanceCollectible(db, m)
        }
      }
    }
    default:
      return null
  }
}
