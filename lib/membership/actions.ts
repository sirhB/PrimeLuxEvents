'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { requireStripe } from '@/lib/stripe'
import { canSubscribe } from './policy'
import { banPlanner, getMembership, isBanned } from './server'
import { membershipPriceId, siteUrl } from './stripe'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

async function caller() {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return null
  const { data: isAdmin } = await db.rpc('is_admin')
  return { db, user, isAdmin: Boolean(isAdmin) }
}

const REASONS = {
  banned: 'This account can’t join the planner membership.',
  already_member: 'You’re already a member.',
  policies: 'Please accept the membership policies first.',
} as const

/** Start Stripe Checkout (subscription mode). Ban is enforced here, server-side, every time. */
export async function startMembershipCheckout(acceptedPolicies: boolean): Promise<Result<{ url: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in to join' }
  const svc = createServiceRoleClient()
  const email = c.user.email ?? null
  const membership = await getMembership(svc, c.user.id)
  let banned: boolean
  try { banned = await isBanned(svc, c.user.id, email) } catch { return { ok: false, error: 'Please try again in a moment' } }
  const gate = canSubscribe({ banned, status: membership?.status ?? null, acceptedPolicies })
  if (!gate.ok) return { ok: false, error: REASONS[gate.reason] }

  try {
    const stripe = requireStripe()
    let customerId = membership?.stripe_customer_id ?? null
    if (customerId) {
      // A banned Stripe customer can't come back through a fresh account either.
      const { data: custBan } = await svc.from('planner_bans').select('id').eq('stripe_customer_id', customerId).maybeSingle()
      if (custBan) return { ok: false, error: REASONS.banned }
    } else {
      const customer = await stripe.customers.create({
        email: email ?? undefined,
        metadata: { planner_user_id: c.user.id, kind: 'planner_membership' },
      }, { idempotencyKey: `planner-customer-${c.user.id}` })
      customerId = customer.id
    }
    const now = new Date().toISOString()
    await svc.from('planner_memberships').upsert({
      planner_user_id: c.user.id, stripe_customer_id: customerId,
      status: membership?.status && membership.status !== 'canceled' ? membership.status : 'incomplete',
      policies_accepted_at: now, updated_at: now,
    }, { onConflict: 'planner_user_id' })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: c.user.id,
      line_items: [{ price: await membershipPriceId(), quantity: 1 }],
      allow_promotion_codes: false, // no combining offers
      subscription_data: { metadata: { kind: 'planner_membership', planner_user_id: c.user.id } },
      metadata: { kind: 'planner_membership', planner_user_id: c.user.id },
      success_url: `${siteUrl()}/planners/membership?joined=1`,
      cancel_url: `${siteUrl()}/planners/membership`,
    })
    if (!session.url) return { ok: false, error: 'Stripe returned no checkout link' }
    return { ok: true, url: session.url }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** Stripe Billing customer portal (update card, see invoices, cancel). */
export async function openBillingPortal(): Promise<Result<{ url: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const m = await getMembership(createServiceRoleClient(), c.user.id)
  if (!m?.stripe_customer_id) return { ok: false, error: 'No membership on file' }
  if (m.status === 'terminated') return { ok: false, error: REASONS.banned }
  try {
    const portal = await requireStripe().billingPortal.sessions.create({
      customer: m.stripe_customer_id, return_url: `${siteUrl()}/planners/membership`,
    })
    return { ok: true, url: portal.url }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** Admin: terminate for sharing. Cancels now (no refund, no proration) and bans permanently. */
export async function terminateMemberForSharing(plannerId: string, confirmText: string): Promise<Result> {
  const c = await caller()
  if (!c?.isAdmin) return { ok: false, error: 'Admins only' }
  if (confirmText.trim().toUpperCase() !== 'TERMINATE') return { ok: false, error: 'Type TERMINATE to confirm' }
  const svc = createServiceRoleClient()
  const m = await getMembership(svc, plannerId)
  if (m?.stripe_subscription_id) {
    try {
      await requireStripe().subscriptions.cancel(m.stripe_subscription_id, { prorate: false, invoice_now: false })
    } catch (e) {
      const msg = (e as Error).message
      if (!/No such subscription|canceled/i.test(msg)) return { ok: false, error: msg }
    }
  }
  await banPlanner(svc, { userId: plannerId, reason: 'sharing', bannedBy: c.user.id, customerId: m?.stripe_customer_id })
  revalidatePath('/admin/members')
  return { ok: true }
}

/** Admin: who plans which client event. */
export async function assignPlannerToEvent(leadId: string, plannerId: string): Promise<Result> {
  const c = await caller()
  if (!c?.isAdmin) return { ok: false, error: 'Admins only' }
  const { error } = await c.db.from('planner_event_assignments').upsert({ lead_id: leadId, planner_user_id: plannerId, assigned_by: c.user.id }, { onConflict: 'lead_id' })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/members')
  return { ok: true }
}

/** Admin: member-discount eligibility per product or category. null clears the rule. */
export async function setEligibility(targetType: 'product' | 'category', targetId: string, eligible: boolean | null): Promise<Result> {
  const c = await caller()
  if (!c?.isAdmin) return { ok: false, error: 'Admins only' }
  const q = c.db.from('member_discount_eligibility')
  const { error } = eligible == null
    ? await q.delete().eq('target_type', targetType).eq('target_id', targetId)
    : await q.upsert({ target_type: targetType, target_id: targetId, eligible, updated_by: c.user.id, updated_at: new Date().toISOString() }, { onConflict: 'target_type,target_id' })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/members')
  return { ok: true }
}

