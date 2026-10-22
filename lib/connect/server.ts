import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ConnectStatus = {
  accountId: string | null
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
}

export const NO_CONNECT: ConnectStatus = { accountId: null, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false }

/** Planner can issue client payment links only when Stripe says the account can take charges. */
export const canTakePayments = (s: ConnectStatus) => Boolean(s.accountId && s.chargesEnabled)

export async function getConnectStatus(db: SupabaseClient, plannerUserId: string): Promise<ConnectStatus> {
  if (!plannerUserId) return NO_CONNECT
  const { data } = await db.from('planner_connect_accounts').select('*').eq('planner_user_id', plannerUserId).maybeSingle()
  if (!data) return NO_CONNECT
  return { accountId: data.stripe_account_id, chargesEnabled: data.charges_enabled, payoutsEnabled: data.payouts_enabled, detailsSubmitted: data.details_submitted }
}

/** Mirror a Stripe Account onto our row (service role). Source of truth: account.updated. */
export async function syncConnectAccount(db: SupabaseClient, a: Stripe.Account) {
  await db.from('planner_connect_accounts').update({
    charges_enabled: Boolean(a.charges_enabled),
    payouts_enabled: Boolean(a.payouts_enabled),
    details_submitted: Boolean(a.details_submitted),
    updated_at: new Date().toISOString(),
  }).eq('stripe_account_id', a.id)
}
