'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { requireStripe, stripe } from '@/lib/stripe'
import { siteUrl } from '@/lib/membership/stripe'
import { isActivePlanner } from '@/lib/membership/server'
import { getConnectStatus, syncConnectAccount } from './server'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }

/**
 * "Connect payouts": create (once) the planner's Express account and return a Stripe-hosted
 * onboarding Account Link. The planner is merchant of record for client charges.
 */
export async function startConnectOnboarding(): Promise<Result<{ url: string }>> {
  if (!stripe) return { ok: false, error: 'Payments are not configured' }
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { ok: false, error: 'Sign in first' }
  if (!(await isActivePlanner(createServiceRoleClient(), user.id))) return { ok: false, error: 'An active planner membership is required' }
  const s = requireStripe()
  const svc = createServiceRoleClient()
  let { accountId } = await getConnectStatus(svc, user.id)
  if (!accountId) {
    const acct = await s.accounts.create({
      type: 'express',
      email: user.email ?? undefined,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_profile: { mcc: '7299', product_description: 'Event planning; rentals fulfilled by Prime Lux Events' },
      metadata: { planner_user_id: user.id },
    }, { idempotencyKey: `connect-acct-${user.id}` })
    const { error } = await svc.from('planner_connect_accounts').insert({ planner_user_id: user.id, stripe_account_id: acct.id })
    if (error && error.code !== '23505') return { ok: false, error: 'Could not save account' }
    accountId = (await getConnectStatus(svc, user.id)).accountId ?? acct.id
  }
  const link = await s.accountLinks.create({
    account: accountId,
    type: 'account_onboarding',
    refresh_url: `${siteUrl()}/planners/membership?connect=refresh`,
    return_url: `${siteUrl()}/planners/membership?connect=return`,
  })
  return { ok: true, url: link.url }
}

/** Re-read status from Stripe (on return from onboarding; webhooks stay the source of truth). */
export async function refreshConnectStatus(): Promise<Result> {
  if (!stripe) return { ok: false, error: 'Payments are not configured' }
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { ok: false, error: 'Sign in first' }
  const svc = createServiceRoleClient()
  const { accountId } = await getConnectStatus(svc, user.id)
  if (!accountId) return { ok: false, error: 'No payouts account yet' }
  await syncConnectAccount(svc, await requireStripe().accounts.retrieve(accountId))
  revalidatePath('/planners/membership')
  return { ok: true }
}

/** Express dashboard login link (payouts, balances, tax forms). */
export async function openPayoutsDashboard(): Promise<Result<{ url: string }>> {
  if (!stripe) return { ok: false, error: 'Payments are not configured' }
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return { ok: false, error: 'Sign in first' }
  const { accountId } = await getConnectStatus(createServiceRoleClient(), user.id)
  if (!accountId) return { ok: false, error: 'No payouts account yet' }
  const l = await requireStripe().accounts.createLoginLink(accountId)
  return { ok: true, url: l.url }
}
