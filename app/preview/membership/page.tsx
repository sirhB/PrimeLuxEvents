import { MembershipSignup } from '@/components/membership/membership-signup'

export const dynamic = 'force-dynamic'

export default async function MembershipPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams
  if (state === 'member') return <MembershipSignup state={{ signedIn: true, status: 'active', banned: false, periodEnd: '2026-11-21T00:00:00Z', connect: { started: true, chargesEnabled: false, payoutsEnabled: false } }} demo />
  return <MembershipSignup state={{ signedIn: true, status: 'none', banned: false, periodEnd: null }} demo />
}
