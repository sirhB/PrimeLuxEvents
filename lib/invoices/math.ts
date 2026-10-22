/**
 * Pure planner-invoice math. No I/O, no path aliases (scripts/check-carts.mjs imports it).
 *
 * An invoice mixes:
 *   catalog lines: Prime Lux rentals, priced exactly like carts (member cost + planner markup)
 *   custom lines:  the planner's own services (planning fee, coordination, third-party vendors)
 * The Prime Lux rental share covers ONLY the catalog lines (primeLuxFeeCents, same as carts).
 * The Prime Lux platform fee (applicationFeeForPayment) applies to every payment, custom lines
 * included, so a custom-only invoice still carries the platform fee (0% by default).
 */
import { priceCart, type PricingContext, type PricingLineInput } from '../carts/pricing.ts'
import { primeLuxFeeCents } from '../carts/split.ts'
import type { MembershipStatus } from '../membership/policy.ts'

export type CustomLineInput = { unitCents: number; quantity: number; taxable: boolean }

export type InvoicePricing = {
  catalogSubtotalCents: number
  catalogSetupCents: number
  catalogCostCents: number
  customSubtotalCents: number
  deliveryFeeCents: number
  taxCents: number
  totalCents: number
  /** Prime Lux rental share for the whole invoice (catalog lines only). The platform fee is added per payment. */
  primeLuxFeeCents: number
  /** What the planner keeps before the platform fee and Stripe fees. */
  plannerGrossCents: number
}

const n = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0)

export function priceInvoice(
  catalog: PricingLineInput[],
  custom: CustomLineInput[],
  ctx: PricingContext,
  fees: { deliveryFeeCents?: number; taxRate?: number; marketplaceFacilitator?: boolean } = {},
): InvoicePricing {
  const rate = fees.taxRate != null && fees.taxRate >= 0 && fees.taxRate < 1 ? fees.taxRate : 0
  // Delivery is a Prime Lux fee; it only applies when there are catalog lines.
  const delivery = catalog.length ? n(fees.deliveryFeeCents ?? 0) : 0
  const c = priceCart(catalog, ctx, { deliveryFeeCents: delivery, taxRate: rate })
  const customSub = custom.reduce((a, l) => a + n(l.unitCents) * Math.max(0, Math.floor(l.quantity)), 0)
  const customTaxable = custom.filter((l) => l.taxable).reduce((a, l) => a + n(l.unitCents) * Math.max(0, Math.floor(l.quantity)), 0)
  const tax = c.taxCents + Math.round(customTaxable * rate)
  const total = c.totalCents + customSub + Math.round(customTaxable * rate)
  const fee = catalog.length
    ? primeLuxFeeCents({ rentalCostCents: c.costCents, setupFeeCents: c.setupFeeCents, deliveryFeeCents: c.deliveryFeeCents, taxRate: rate, totalCents: c.totalCents, marketplaceFacilitator: fees.marketplaceFacilitator })
    : 0
  return {
    catalogSubtotalCents: c.subtotalCents, catalogSetupCents: c.setupFeeCents, catalogCostCents: c.costCents,
    customSubtotalCents: customSub, deliveryFeeCents: c.deliveryFeeCents, taxCents: tax, totalCents: total,
    primeLuxFeeCents: fee, plannerGrossCents: total - fee,
  }
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
export type DisplayStatus = 'draft' | 'open' | 'overdue' | 'paid' | 'void'

/** Stripe has no "overdue" status: open + past due date. */
export function displayStatus(status: InvoiceStatus, dueDate: string | null, today: string): DisplayStatus {
  if (status === 'uncollectible') return 'overdue'
  if (status === 'open' && dueDate && dueDate < today) return 'overdue'
  return status as DisplayStatus
}

/**
 * Membership gating. Only active (not banned) members create or send invoices.
 * Paying is never gated: an open invoice stays payable after the membership ends.
 */
export type InvoiceAction = 'create' | 'edit' | 'send' | 'void' | 'pay' | 'view'
export function invoiceAllowed(action: InvoiceAction, m: { status: MembershipStatus; banned: boolean }): boolean {
  if (action === 'pay' || action === 'view') return true
  // Voiding an invoice the planner already issued is cleanup, so it stays allowed after the membership ends.
  if (action === 'void') return true
  return m.status === 'active' && !m.banned
}
