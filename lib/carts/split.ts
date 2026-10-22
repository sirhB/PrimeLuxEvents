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
  /**
   * Admin setting "Prime Lux collects sales tax as a marketplace facilitator" (off by default).
   * Only when on does Prime Lux's share include tax on its rentals.
   * TODO(CPA): CT marketplace facilitator rule (CGS 12-408e, $250k threshold) needs CPA review
   * before this is turned on.
   */
  marketplaceFacilitator?: boolean
}

/**
 * PRIME LUX SHARE (application fee for the whole cart):
 *
 *   fee = rental cost (member price) + setup fees + delivery fee
 *       + tax on its rentals = round((rental cost + setup) × tax rate), ONLY when the admin
 *         marketplace-facilitator setting is on (off by default)
 *
 * Delivery isn't taxed, matching the site checkout. Capped at the cart total.
 * The planner keeps the rest (their markup and the tax on it), minus Stripe's processing fee.
 * NOTE: the tax line assumes Prime Lux must collect tax on its own rental cost; confirm with
 * the accountant. Change it here and only here.
 */
export function primeLuxFeeCents(i: CartFeeInputs): number {
  const n = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0)
  const rate = i.taxRate >= 0 && i.taxRate < 1 ? i.taxRate : 0
  const rentalTax = i.marketplaceFacilitator ? Math.round((n(i.rentalCostCents) + n(i.setupFeeCents)) * rate) : 0
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

export type PaymentSplit = {
  clientPaidCents: number
  /** Total application fee kept by Prime Lux (rental share + platform fee), net of refunds. */
  primeLuxFeeCents: number
  rentalShareCents: number
  platformFeeCents: number
  stripeFeeCents: number | null
  plannerNetCents: number | null
}

/** Read-only split for one payment, net of refunds. Stripe's fee is null until known. */
export function paymentSplit(p: { amountCents: number; applicationFeeCents: number; platformFeeCents?: number; stripeFeeCents: number | null; refundedCents?: number; feeRefundedCents?: number }): PaymentSplit {
  const paid = Math.max(0, p.amountCents - (p.refundedCents ?? 0))
  const fee = Math.max(0, p.applicationFeeCents - (p.feeRefundedCents ?? 0))
  const platformGross = Math.min(p.applicationFeeCents, Math.max(0, p.platformFeeCents ?? 0))
  const back = splitFeeRefund(p.feeRefundedCents ?? 0, p.applicationFeeCents - platformGross, platformGross)
  const platform = platformGross - back.platform
  return {
    clientPaidCents: paid,
    primeLuxFeeCents: fee,
    rentalShareCents: fee - platform,
    platformFeeCents: platform,
    stripeFeeCents: p.stripeFeeCents,
    plannerNetCents: p.stripeFeeCents == null ? null : paid - fee - p.stripeFeeCents,
  }
}

/**
 * Prime Lux platform/service fee (admin-defined, default 0). Charged on EVERY payment a
 * planner collects (cart payments and invoices, including the planner's own custom lines).
 *
 * Connecticut surcharge compliance: this fee is deducted from the PLANNER'S PROCEEDS inside
 * the application fee. It is never added to the client's total, never shown to clients, and
 * never varies by payment method.
 */
export type PlatformFeeConfig = {
  /** Percentage in basis points (250 = 2.5%). */
  bps: number
  /** Flat amount per payment, in cents. */
  flatCents: number
  /** Optional minimum per payment (cents). */
  minCents: number | null
  /** Optional cap per payment (cents). */
  capCents: number | null
}

export const ZERO_PLATFORM_FEE: PlatformFeeConfig = { bps: 0, flatCents: 0, minCents: null, capCents: null }

export function platformFeeCents(amountCents: number, cfg: PlatformFeeConfig = ZERO_PLATFORM_FEE): number {
  const amt = Number.isFinite(amountCents) ? Math.max(0, Math.round(amountCents)) : 0
  if (amt === 0) return 0
  const pct = Math.max(0, Math.round((amt * Math.max(0, cfg.bps || 0)) / 10000))
  let fee = pct + Math.max(0, Math.round(cfg.flatCents || 0))
  if (fee === 0) return 0 // a minimum never turns a 0% fee into a charge
  if (cfg.minCents != null && cfg.minCents > 0) fee = Math.max(fee, cfg.minCents)
  if (cfg.capCents != null && cfg.capCents >= 0) fee = Math.min(fee, cfg.capCents)
  return Math.min(fee, amt)
}

export type PaymentFee = { rentalShareCents: number; platformFeeCents: number; applicationFeeCents: number }

/**
 * THE application fee for one client payment:
 *   application_fee = rental share (allocateFees of primeLuxFeeCents) + platform fee
 * Never exceeds the payment. Rental share wins if they'd overflow (platform fee shrinks).
 */
export function applicationFeeForPayment(amountCents: number, rentalShareCents: number, cfg: PlatformFeeConfig = ZERO_PLATFORM_FEE): PaymentFee {
  const amt = Math.max(0, Math.round(amountCents))
  const share = Math.min(amt, Math.max(0, Math.round(rentalShareCents)))
  const platform = Math.min(amt - share, platformFeeCents(amt, cfg))
  return { rentalShareCents: share, platformFeeCents: platform, applicationFeeCents: share + platform }
}

/** Split a fee refund (proportional, like refund_application_fee) between rental share and platform fee. */
export function splitFeeRefund(feeRefundedCents: number, rentalShareCents: number, platformCents: number): { rental: number; platform: number } {
  const total = rentalShareCents + platformCents
  if (total <= 0 || feeRefundedCents <= 0) return { rental: 0, platform: 0 }
  const platform = Math.min(platformCents, Math.round((feeRefundedCents * platformCents) / total))
  return { rental: Math.min(rentalShareCents, feeRefundedCents - platform), platform }
}

/**
 * CT surcharge rule: planners can't add card/processing/transaction/convenience fees or
 * non-cash adjustments as line items. Phrase-based so "place cards" or "invitations" pass.
 */
const BLOCKED_FEE = [
  /\b(credit|debit)?\s*card\s*(processing\s*)?(fee|charge|surcharge|cost)s?\b/i,
  /\b(processing|transaction|convenience|payment|swipe|merchant|checkout|online\s+payment)\s*(fee|charge|surcharge|cost)s?\b/i,
  /\bsurcharg/i,
  /\bnon[-\s]?cash\s*(adjustment|discount|fee|charge)s?\b/i,
  /\bcash\s*discount/i,
]
export function isBlockedFeeLabel(text: string | null | undefined): boolean {
  const t = (text ?? '').trim()
  return t.length > 0 && BLOCKED_FEE.some((r) => r.test(t))
}

/** Plain-language rate for the planner policy page ("2.5% + $0.30 per payment, max $50"). */
export function describePlatformFee(cfg: PlatformFeeConfig): string {
  const $ = (c: number) => `$${(c / 100).toFixed(2).replace(/\.00$/, '')}`
  const parts: string[] = []
  if (cfg.bps > 0) parts.push(`${(cfg.bps / 100).toFixed(2).replace(/\.?0+$/, '')}%`)
  if (cfg.flatCents > 0) parts.push($(cfg.flatCents))
  if (!parts.length) return 'currently 0%'
  let out = `${parts.join(' + ')} per payment`
  if (cfg.minCents) out += `, minimum ${$(cfg.minCents)}`
  if (cfg.capCents != null) out += `, maximum ${$(cfg.capCents)}`
  return out
}
