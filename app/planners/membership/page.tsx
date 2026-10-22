import type { Metadata } from 'next'
import { MembershipSignup } from '@/components/membership/membership-signup'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { getMembership, isBanned } from '@/lib/membership/server'
import { getConnectStatus } from '@/lib/connect/server'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Planner Membership · Prime Lux Events', description: '$99/month for 50% off eligible rentals.' }

export default async function MembershipPage({ searchParams }: { searchParams: Promise<{ joined?: string; connect?: string }> }) {
  const { joined, connect } = await searchParams
  let state = { signedIn: false, status: 'none' as const, banned: false, periodEnd: null as string | null, joined: joined === '1', connect: undefined as undefined | { started: boolean; chargesEnabled: boolean; payoutsEnabled: boolean }, connectReturn: connect === 'return' }
  try {
    const db = await createClient()
    const { data: { user } } = await db.auth.getUser()
    if (user) {
      const svc = createServiceRoleClient()
      const m = await getMembership(svc, user.id)
      const banned = await isBanned(svc, user.id, user.email ?? null).catch(() => true)
      const cs = await getConnectStatus(svc, user.id)
      state = { ...state, connect: { started: Boolean(cs.accountId), chargesEnabled: cs.chargesEnabled, payoutsEnabled: cs.payoutsEnabled }, signedIn: true, status: (m?.status ?? 'none') as never, banned, periodEnd: m?.current_period_end ?? null }
    }
  } catch {
    // Signed-out or Supabase unavailable: show the public page.
  }
  return <MembershipSignup state={state} />
}
