'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { createCheckoutLink, createConnectedAccount, createVerification, whopConfigured } from '@/lib/whop/client'
import { recomputeEventCommission, transferPlannerEarnings } from './sync'
import type { EarnTrigger, PaymentKind } from './calc'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

async function caller() {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return null
  const { data: isAdmin } = await db.rpc('is_admin')
  return { db, user, isAdmin: Boolean(isAdmin) }
}

const TRIGGERS: EarnTrigger[] = ['deposit', 'final_payment']
const KINDS: PaymentKind[] = ['deposit', 'installment', 'final']
const bps = (pct: number | null) => (pct == null || Number.isNaN(pct) ? null : Math.round(Math.min(100, Math.max(0, pct)) * 100))
const done = () => { revalidatePath('/admin/commissions'); revalidatePath('/admin/my-earnings') }

/** Create (or reuse) the planner's Whop connected account. Admin, or the planner for themself. */
export async function connectPlannerAccount(plannerId?: string): Promise<Result<{ accountId: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const target = plannerId ?? c.user.id
  if (target !== c.user.id && !c.isAdmin) return { ok: false, error: 'Admins only' }
  if (!whopConfigured()) return { ok: false, error: 'Whop is not configured' }

  const svc = createServiceRoleClient()
  const { data: existing } = await svc.from('planner_payout_profiles').select('whop_account_id').eq('planner_user_id', target).maybeSingle()
  if (existing?.whop_account_id) return { ok: true, accountId: existing.whop_account_id }

  const { data: auth } = await svc.auth.admin.getUserById(target)
  const email = auth.user?.email
  if (!email) return { ok: false, error: 'Planner has no email' }
  const { data: prof } = await svc.from('user_profiles').select('full_name').eq('id', target).maybeSingle()
  const title = prof?.full_name || email
  try {
    const account = await createConnectedAccount({ email, title, plannerUserId: target })
    await svc.from('planner_payout_profiles').upsert({
      planner_user_id: target, display_name: title, whop_account_id: account.id, updated_at: new Date().toISOString(),
    }, { onConflict: 'planner_user_id' })
    done()
    return { ok: true, accountId: account.id }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** Hosted Whop KYC session. Returns a URL the planner opens. */
export async function startPlannerKyc(plannerId?: string): Promise<Result<{ url: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const target = plannerId ?? c.user.id
  if (target !== c.user.id && !c.isAdmin) return { ok: false, error: 'Admins only' }
  const connected = await connectPlannerAccount(target)
  if (!connected.ok) return connected
  try {
    const v = await createVerification(connected.accountId)
    if (!v.session_url) return { ok: false, error: 'Whop returned no verification link' }
    await createServiceRoleClient().from('planner_payout_profiles')
      .update({ kyc_status: 'pending', kyc_verification_id: v.id, updated_at: new Date().toISOString() })
      .eq('planner_user_id', target).neq('kyc_status', 'approved')
    done()
    return { ok: true, url: v.session_url }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** Checkout link for an event. Money lands in the Prime Lux balance; metadata tags event + planner. */
export async function createEventCheckout(input: { leadId: string; kind: PaymentKind; amount: number; title?: string }): Promise<Result<{ url: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  if (!KINDS.includes(input.kind)) return { ok: false, error: 'Pick deposit, installment, or final' }
  const amountCents = Math.round(input.amount * 100)
  if (!Number.isFinite(amountCents) || amountCents < 100) return { ok: false, error: 'Amount must be at least $1' }
  if (!whopConfigured()) return { ok: false, error: 'Whop is not configured' }

  const svc = createServiceRoleClient()
  const { data: terms } = await svc.from('event_commission_terms').select('planner_user_id').eq('lead_id', input.leadId).maybeSingle()
  if (!terms) return { ok: false, error: 'Assign a planner to this event first' }
  if (terms.planner_user_id !== c.user.id && !c.isAdmin) return { ok: false, error: 'Not your event' }

  const { data: settings } = await svc.from('commission_settings').select('currency').eq('id', 1).maybeSingle()
  const currency = settings?.currency ?? 'usd'
  const title = input.title?.trim() || `Prime Lux Events · ${input.kind === 'final' ? 'Final payment' : input.kind === 'deposit' ? 'Deposit' : 'Installment'}`
  const { data: link, error } = await svc.from('whop_checkout_links').insert({
    lead_id: input.leadId, planner_user_id: terms.planner_user_id, kind: input.kind, amount_cents: amountCents,
    currency, title, created_by: c.user.id,
  }).select('id').single()
  if (error || !link) return { ok: false, error: 'Could not save link' }

  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL
    const checkout = await createCheckoutLink({
      amountCents, currency, title,
      redirectUrl: site ? site : undefined,
      metadata: { lead_id: input.leadId, planner_user_id: terms.planner_user_id, kind: input.kind, checkout_link_id: link.id },
      idempotencyKey: `checkout-${link.id}`,
    })
    await svc.from('whop_checkout_links')
      .update({ whop_checkout_id: checkout.id, whop_plan_id: checkout.plan?.id ?? null, purchase_url: checkout.purchase_url })
      .eq('id', link.id)
    done()
    return { ok: true, url: checkout.purchase_url }
  } catch (e) {
    await svc.from('whop_checkout_links').update({ status: 'void' }).eq('id', link.id)
    return { ok: false, error: (e as Error).message }
  }
}

/** Admin: planner default rate (percent) and trigger. null = use global default. */
export async function updatePlannerTerms(plannerId: string, ratePct: number | null, trigger: EarnTrigger | null): Promise<Result> {
  const c = await caller()
  if (!c?.isAdmin) return { ok: false, error: 'Admins only' }
  if (trigger && !TRIGGERS.includes(trigger)) return { ok: false, error: 'Bad trigger' }
  const { error } = await c.db.from('planner_payout_profiles').upsert({
    planner_user_id: plannerId, rate_bps: bps(ratePct), earn_trigger: trigger, updated_at: new Date().toISOString(),
  }, { onConflict: 'planner_user_id' })
  if (error) return { ok: false, error: error.message }
  done()
  return { ok: true }
}

/** Admin: assign the planner for an event and optional overrides; recomputes the ledger. */
export async function updateEventTerms(input: { leadId: string; plannerId: string; ratePct: number | null; trigger: EarnTrigger | null }): Promise<Result> {
  const c = await caller()
  if (!c?.isAdmin) return { ok: false, error: 'Admins only' }
  if (input.trigger && !TRIGGERS.includes(input.trigger)) return { ok: false, error: 'Bad trigger' }
  const { error } = await c.db.from('event_commission_terms').upsert({
    lead_id: input.leadId, planner_user_id: input.plannerId, rate_bps_override: bps(input.ratePct),
    earn_trigger_override: input.trigger, updated_by: c.user.id, updated_at: new Date().toISOString(),
  }, { onConflict: 'lead_id' })
  if (error) return { ok: false, error: error.message }
  await recomputeEventCommission(createServiceRoleClient(), input.leadId)
  done()
  return { ok: true }
}

/** Admin: global default rate, trigger, auto-transfer. */
export async function updateCommissionSettings(input: { ratePct: number; trigger: EarnTrigger; autoTransfer: boolean }): Promise<Result> {
  const c = await caller()
  if (!c?.isAdmin) return { ok: false, error: 'Admins only' }
  if (!TRIGGERS.includes(input.trigger)) return { ok: false, error: 'Bad trigger' }
  const { error } = await c.db.from('commission_settings').update({
    default_rate_bps: bps(input.ratePct) ?? 1000, earn_trigger: input.trigger, auto_transfer: input.autoTransfer,
    updated_by: c.user.id, updated_at: new Date().toISOString(),
  }).eq('id', 1)
  if (error) return { ok: false, error: error.message }
  done()
  return { ok: true }
}

/** Admin: pay out a planner's earned balance now. */
export async function payPlannerNow(plannerId: string): Promise<Result<{ transferId?: string }>> {
  const c = await caller()
  if (!c?.isAdmin) return { ok: false, error: 'Admins only' }
  const r = await transferPlannerEarnings(createServiceRoleClient(), plannerId)
  done()
  return r.ok ? { ok: true, transferId: r.transferId } : { ok: false, error: r.reason ?? 'Transfer failed' }
}
