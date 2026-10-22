/**
 * Pure membership rules. No I/O, no path aliases (scripts/check-carts.mjs imports it).
 */

/**
 * balance_due: the planner canceled while past due. They still owe the unpaid membership
 * invoices; those stay open and collectible. No member pricing, carts, or invoicing. Once the
 * balance is paid OR collection ends unpaid, they are terminated with a permanent ban.
 */
export type MembershipStatus = 'none' | 'incomplete' | 'active' | 'past_due' | 'balance_due' | 'canceled' | 'terminated'
export type TerminationReason = 'nonpayment' | 'sharing'

export const MEMBERSHIP_PRICE_CENTS = 9900
export const MEMBER_DISCOUNT_BPS = 5000

/** Policy copy shown on the signup page (keep in sync with the flyer). */
export const MEMBERSHIP_POLICIES = [
  { title: 'Nontransferable', body: 'Your membership belongs to your planner account only. It can’t be shared, transferred, or used for another planner.' },
  { title: 'Nonpayment means termination', body: 'If your monthly payment fails and isn’t resolved, your membership is terminated and you are permanently banned from rejoining.' },
  { title: 'Past-due balances are still owed', body: 'Canceling while a payment is past due doesn’t erase it. The unpaid membership payments stay due and Stripe keeps trying to collect them; member pricing, carts, and invoicing stop right away. Once the balance is paid, or collection ends unpaid, the membership is terminated and you can never rejoin.' },
  { title: 'Nonrefundable', body: 'Membership fees are nonrefundable.' },
  { title: 'No combining offers', body: 'The 50% member discount can’t be combined with any other offer, promo code, or discount.' },
  { title: 'Book through Prime Lux', body: 'Every rental booking goes through Prime Lux. Clients pay you through Prime Lux (Stripe), Prime Lux’s share is split out automatically, and you keep your markup.' },
] as const

export type SubscribeCheck = { ok: true } | { ok: false; reason: 'banned' | 'already_member' | 'policies' }

/** Server-side gate for starting a subscription. A ban is permanent: nothing overrides it. */
export function canSubscribe(input: { banned: boolean; status: MembershipStatus | null; acceptedPolicies: boolean }): SubscribeCheck {
  // balance_due ends in a permanent ban either way, so it can never rejoin either.
  if (input.banned || input.status === 'terminated' || input.status === 'balance_due') return { ok: false, reason: 'banned' }
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
  /** A membership invoice was paid while balance_due; openRemaining = open membership invoices left. */
  | { type: 'balance.invoice_paid'; openRemaining: number }
  /** Collection ended unpaid: invoice marked uncollectible/voided, or the last retry failed. */
  | { type: 'balance.collection_ended' }

export type Transition = { status: MembershipStatus; ban: TerminationReason | null }

/**
 * Next state for a Stripe/admin event. Once terminated, nothing brings a member back.
 * Stripe "unpaid" (retries exhausted, subscription kept) or a deletion caused by
 * payment failure both terminate with a permanent nonpayment ban. A voluntary cancel
 * while past due becomes balance_due (see MembershipStatus).
 */
export function nextMembershipState(current: MembershipStatus, ev: MembershipEvent): Transition {
  if (current === 'terminated') return { status: 'terminated', ban: null }
  // Canceled while past due: only settling or collection ending moves it (both end in a ban).
  if (current === 'balance_due') {
    if (ev.type === 'admin.terminate') return { status: 'terminated', ban: 'sharing' }
    if (ev.type === 'balance.invoice_paid') return ev.openRemaining > 0 ? { status: 'balance_due', ban: null } : { status: 'terminated', ban: 'nonpayment' }
    if (ev.type === 'balance.collection_ended') return { status: 'terminated', ban: 'nonpayment' }
    return { status: 'balance_due', ban: null }
  }
  switch (ev.type) {
    case 'balance.invoice_paid':
    case 'balance.collection_ended':
      return { status: current, ban: null }
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
      // Stripe canceled it after retries ran out: collection ended unpaid.
      if (ev.cancellationReason === 'payment_failed') return { status: 'terminated', ban: 'nonpayment' }
      // The planner canceled while past due: the balance is still owed.
      if (current === 'past_due') return { status: 'balance_due', ban: null }
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
