/** Pure refund helpers (no I/O) so they can be tested with node --experimental-strip-types. */

export const REFUND_REASONS = ['requested_by_customer', 'duplicate', 'fraudulent', 'other'] as const
export type RefundReasonCode = (typeof REFUND_REASONS)[number]

export type RefundPlan =
  | { ok: true; amount: number; full: boolean; remainingAfter: number }
  | { ok: false; error: string }

/**
 * Work out how much to refund.
 * `chargedCents` and `alreadyRefundedCents` should come from Stripe (the source of truth).
 * Omitted / blank `requestedCents` means "refund everything left".
 */
export function planRefund(chargedCents: number, alreadyRefundedCents: number, requestedCents?: number | null): RefundPlan {
  const charged = Math.max(0, Math.round(Number(chargedCents) || 0))
  const refunded = Math.max(0, Math.round(Number(alreadyRefundedCents) || 0))
  const remaining = Math.max(0, charged - refunded)
  if (remaining <= 0) return { ok: false, error: 'This payment has already been fully refunded.' }
  if (requestedCents === undefined || requestedCents === null) {
    return { ok: true, amount: remaining, full: true, remainingAfter: 0 }
  }
  const amount = Math.round(Number(requestedCents))
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'Enter an amount greater than $0.' }
  if (amount > remaining) return { ok: false, error: `You can refund at most $${(remaining / 100).toFixed(2)}.` }
  return { ok: true, amount, full: amount === remaining, remainingAfter: remaining - amount }
}

/** Stripe accepts only three reason codes; everything else is sent without one. */
export function stripeReason(code: string): 'requested_by_customer' | 'duplicate' | 'fraudulent' | undefined {
  return code === 'requested_by_customer' || code === 'duplicate' || code === 'fraudulent' ? code : undefined
}

/** Idempotency keys are generated per confirmation dialog; reject anything that is not a plain token. */
export function validIdempotencyKey(key: string): boolean {
  return /^[A-Za-z0-9_-]{16,80}$/.test(key)
}
