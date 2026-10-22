/**
 * Pure Stripe Connect split math. No I/O, no path aliases (scripts/check-carts.mjs imports it).
 *
 * Client payments are direct charges on the planner's Express account (planner = merchant
 * of record). Prime Lux takes its share as the application fee on each charge.
 */

export type CartFeeInputs = {
  /** Planner cost of rentals: the 50%-off member price (list price if not eligible / not a member). */
  rentalCostCents: number
  /** Prime Lux setup fees on the cart. */
  setupFeeCents: number
  /** Prime Lux delivery fee on the cart. */
  deliveryFeeCents: number
  /** Cart tax rate (same rate as the site checkout). */
  taxRate: number
  /** Cart total the client pays (fee can never exceed it). */
  totalCents: number
}

/**
 * PRIME LUX SHARE (application fee for the whole cart):
 *
 *   fee = rental cost (member price) + setup fees + delivery fee
 *       + tax Prime Lux collects on its rentals = round((rental cost + setup) × tax rate)
 *
 * Delivery isn't taxed, matching the site checkout. Capped at the cart total.
 * The planner keeps the rest (their markup and the tax on it), minus Stripe's processing fee.
 * NOTE: the tax line assumes Prime Lux must collect tax on its own rental cost; confirm with
 * the accountant. Change it here and only here.
 */
export function primeLuxFeeCents(i: CartFeeInputs): number {
  const n = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0)
  const rate = i.taxRate >= 0 && i.taxRate < 1 ? i.taxRate : 0
  const rentalTax = Math.round((n(i.rentalCostCents) + n(i.setupFeeCents)) * rate)
  const fee = n(i.rentalCostCents) + n(i.setupFeeCents) + n(i.deliveryFeeCents) + rentalTax
  return Math.min(fee, n(i.totalCents))
}

/**
 * Spread the cart fee across its payments in proportion to each amount. Rounding remainder
 * goes on the last payment so the fees sum exactly to the cart fee. Already-assigned fees
 * (earlier payments) are honored: pass them in `assignedFeeCents`.
 */
export function allocateFees(amounts: number[], cartFeeCents: number, cartTotalCents: number, assignedFeeCents = 0, assignedAmountCents = 0): number[] {
  const remainingFee = Math.max(0, cartFeeCents - assignedFeeCents)
  const remainingTotal = Math.max(0, cartTotalCents - assignedAmountCents)
  if (!amounts.length) return []
  if (remainingTotal <= 0) return amounts.map(() => 0)
  const out: number[] = []
  let used = 0
  amounts.forEach((a, i) => {
    if (i === amounts.length - 1) out.push(Math.min(a, Math.max(0, remainingFee - used)))
    else {
      const f = Math.min(a, Math.round((remainingFee * a) / remainingTotal))
      out.push(f); used += f
    }
  })
  return out
}

/** Application fee refunded with a refund (refund_application_fee = true is proportional). */
export function feeRefundCents(refundCents: number, paymentCents: number, paymentFeeCents: number): number {
  if (paymentCents <= 0 || refundCents <= 0) return 0
  const r = Math.min(refundCents, paymentCents)
  return Math.min(paymentFeeCents, Math.round((paymentFeeCents * r) / paymentCents))
}

export type PaymentSplit = { clientPaidCents: number; primeLuxFeeCents: number; stripeFeeCents: number | null; plannerNetCents: number | null }

/** Read-only split for one payment, net of refunds. Stripe's fee is null until known. */
export function paymentSplit(p: { amountCents: number; applicationFeeCents: number; stripeFeeCents: number | null; refundedCents?: number; feeRefundedCents?: number }): PaymentSplit {
  const paid = Math.max(0, p.amountCents - (p.refundedCents ?? 0))
  const fee = Math.max(0, p.applicationFeeCents - (p.feeRefundedCents ?? 0))
  return {
    clientPaidCents: paid,
    primeLuxFeeCents: fee,
    stripeFeeCents: p.stripeFeeCents,
    plannerNetCents: p.stripeFeeCents == null ? null : paid - fee - p.stripeFeeCents,
  }
}
