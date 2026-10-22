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

/** A planner-collected payment: a direct charge on the planner's Stripe Connect account. */
export type ConnectPayment = { id: string; amountCents: number; refundedCents: number; applicationFeeCents: number; paidAt?: string | null }

export type ConnectRefundPlan =
  | { ok: true; amount: number; full: boolean; parts: { id: string; amount: number; feeReturnedCents: number }[] }
  | { ok: false; error: string }

/**
 * Planner-collected orders can be paid in several charges (deposit + installments) on the
 * connected account. Spread a refund across them, newest first. Each part is refunded with
 * refund_application_fee, so Stripe returns Prime Lux's application fee in proportion to the
 * amount refunded on that charge; `feeReturnedCents` is that expected share (floor, matching Stripe).
 */
export function planConnectRefund(payments: ConnectPayment[], requestedCents?: number | null): ConnectRefundPlan {
  const live = payments
    .map((p) => ({ ...p, left: Math.max(0, Math.round(p.amountCents) - Math.round(p.refundedCents)) }))
    .filter((p) => p.left > 0)
    .sort((a, b) => String(b.paidAt ?? '').localeCompare(String(a.paidAt ?? '')))
  const remaining = live.reduce((s, p) => s + p.left, 0)
  const plan = planRefund(remaining, 0, requestedCents)
  if (!plan.ok) return plan
  let need = plan.amount
  const parts: { id: string; amount: number; feeReturnedCents: number }[] = []
  for (const p of live) {
    if (need <= 0) break
    const amount = Math.min(need, p.left)
    const feeReturnedCents = p.amountCents > 0 ? Math.floor((p.applicationFeeCents * amount) / p.amountCents) : 0
    parts.push({ id: p.id, amount, feeReturnedCents })
    need -= amount
  }
  return { ok: true, amount: plan.amount, full: plan.full, parts }
}
