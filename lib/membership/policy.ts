/**
 * Pure membership rules. No I/O, no path aliases (scripts/check-carts.mjs imports it).
 */

export type MembershipStatus = 'none' | 'incomplete' | 'active' | 'past_due' | 'canceled' | 'terminated'
export type TerminationReason = 'nonpayment' | 'sharing'

export const MEMBERSHIP_PRICE_CENTS = 9900
export const MEMBER_DISCOUNT_BPS = 5000

/** Policy copy shown on the signup page (keep in sync with the flyer). */
export const MEMBERSHIP_POLICIES = [
  { title: 'Nontransferable', body: 'Your membership belongs to your planner account only. It can’t be shared, transferred, or used for another planner.' },
  { title: 'Nonpayment means termination', body: 'If your monthly payment fails and isn’t resolved, your membership is terminated and you are permanently banned from rejoining.' },
  { title: 'Nonrefundable', body: 'Membership fees are nonrefundable.' },
  { title: 'No combining offers', body: 'The 50% member discount can’t be combined with any other offer, promo code, or discount.' },
  { title: 'Book through Prime Lux', body: 'Every rental booking goes through Prime Lux. Clients pay you through Prime Lux (Stripe), Prime Lux’s share is split out automatically, and you keep your markup.' },
] as const

export type SubscribeCheck = { ok: true } | { ok: false; reason: 'banned' | 'already_member' | 'policies' }

/** Server-side gate for starting a subscription. A ban is permanent: nothing overrides it. */
export function canSubscribe(input: { banned: boolean; status: MembershipStatus | null; acceptedPolicies: boolean }): SubscribeCheck {
  if (input.banned || input.status === 'terminated') return { ok: false, reason: 'banned' }
  if (input.status === 'active' || input.status === 'past_due') return { ok: false, reason: 'already_member' }
  if (!input.acceptedPolicies) return { ok: false, reason: 'policies' }
  return { ok: true }
}

export function isActiveMember(status: MembershipStatus | null | undefined, banned = false): boolean {
  return status === 'active' && !banned
}

export type MembershipEvent =
  | { type: 'invoice.paid' }
  | { type: 'invoice.payment_failed' }
  | { type: 'customer.subscription.updated'; stripeStatus: string }
  | { type: 'customer.subscription.deleted'; cancellationReason?: string | null }
  | { type: 'admin.terminate' }

export type Transition = { status: MembershipStatus; ban: TerminationReason | null }

/**
 * Next state for a Stripe/admin event. Once terminated, nothing brings a member back.
 * Stripe "unpaid" (retries exhausted, subscription kept) or a deletion caused by
 * payment failure both terminate with a permanent nonpayment ban.
 */
export function nextMembershipState(current: MembershipStatus, ev: MembershipEvent): Transition {
  if (current === 'terminated') return { status: 'terminated', ban: null }
  switch (ev.type) {
    case 'admin.terminate':
      return { status: 'terminated', ban: 'sharing' }
    case 'invoice.paid':
      return { status: 'active', ban: null }
    case 'invoice.payment_failed':
      return { status: current === 'none' || current === 'incomplete' ? 'incomplete' : 'past_due', ban: null }
    case 'customer.subscription.updated': {
      const s = ev.stripeStatus
      if (s === 'active' || s === 'trialing') return { status: 'active', ban: null }
      if (s === 'past_due') return { status: 'past_due', ban: null }
      if (s === 'unpaid') return { status: 'terminated', ban: 'nonpayment' }
      if (s === 'incomplete') return { status: 'incomplete', ban: null }
      if (s === 'incomplete_expired') return { status: 'none', ban: null }
      if (s === 'canceled') return { status: 'canceled', ban: null }
      return { status: current, ban: null }
    }
    case 'customer.subscription.deleted':
      if (ev.cancellationReason === 'payment_failed' || current === 'past_due') return { status: 'terminated', ban: 'nonpayment' }
      return { status: 'canceled', ban: null }
  }
}

/** Product rule beats category rule; default is not eligible. */
export function isEligible(
  rules: { productId?: string | null; categoryId?: string | null },
  map: { product: Map<string, boolean>; category: Map<string, boolean> },
): boolean {
  if (rules.productId && map.product.has(rules.productId)) return map.product.get(rules.productId)!
  if (rules.categoryId && map.category.has(rules.categoryId)) return map.category.get(rules.categoryId)!
  return false
}
