import type { SupabaseClient } from '@supabase/supabase-js'
import type { MembershipStatus, TerminationReason } from './policy'

type Db = SupabaseClient

export type MembershipRow = {
  planner_user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: MembershipStatus
  current_period_end: string | null
  terminated_reason: TerminationReason | null
}

export async function getMembership(db: Db, userId: string): Promise<MembershipRow | null> {
  const { data } = await db.from('planner_memberships').select('*').eq('planner_user_id', userId).maybeSingle()
  return (data as MembershipRow | null) ?? null
}

/** Ban check by user id OR email (a new account with a banned email can't rejoin). */
export async function isBanned(db: Db, userId: string | null, email: string | null): Promise<boolean> {
  const { data, error } = await db.rpc('planner_is_banned', { p_user: userId, p_email: email })
  if (error) throw new Error('Could not verify membership eligibility') // fail closed
  return Boolean(data)
}

export async function isActivePlanner(db: Db, userId: string): Promise<boolean> {
  const m = await getMembership(db, userId)
  if (m?.status !== 'active') return false
  return !(await isBanned(db, userId, null))
}

/** Permanent ban: membership terminated + ban row (user, email, customer). Service role only. */
export async function banPlanner(db: Db, input: { userId: string; reason: TerminationReason; bannedBy?: string | null; customerId?: string | null }) {
  const now = new Date().toISOString()
  const { data: auth } = await db.auth.admin.getUserById(input.userId)
  await db.from('planner_memberships').upsert({
    planner_user_id: input.userId, status: 'terminated', terminated_at: now, terminated_reason: input.reason,
    terminated_by: input.bannedBy ?? null, updated_at: now,
  }, { onConflict: 'planner_user_id' })
  const { data: existing } = await db.from('planner_bans').select('id').eq('planner_user_id', input.userId).maybeSingle()
  if (!existing) {
    await db.from('planner_bans').insert({
      planner_user_id: input.userId, email_lower: auth.user?.email?.toLowerCase() ?? null,
      stripe_customer_id: input.customerId ?? null, reason: input.reason, banned_by: input.bannedBy ?? null,
    })
  }
}
