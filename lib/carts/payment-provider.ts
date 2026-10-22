import { requireStripe, stripe } from '@/lib/stripe'
import { siteUrl } from '@/lib/membership/stripe'

/**
 * THE client payment step for planner carts (Stripe Connect, direct charges).
 *
 * Each payment is a single-use Payment Link created ON the planner's Express account
 * (Stripe-Account header), so the planner is merchant of record and Stripe's processing fee
 * comes out of the planner's balance. application_fee_amount = Prime Lux's share of that
 * payment (lib/carts/split.ts), which Stripe moves to the platform automatically.
 * Settlement arrives on the Connect webhook (/api/stripe/connect-webhook).
 */
export type ClientPaymentRequest = {
  paymentId: string
  cartId: string
  connectedAccountId: string
  amountCents: number
  applicationFeeCents: number
  label: string
}

export type ClientPaymentHandle = { providerRef: string; url: string }

export function clientPaymentsEnabled(): boolean {
  return Boolean(stripe)
}

export async function createClientPayment(req: ClientPaymentRequest): Promise<ClientPaymentHandle> {
  const s = requireStripe()
  const metadata = { paymentType: 'planner_cart', planner_cart_id: req.cartId, planner_cart_payment_id: req.paymentId }
  const link = await s.paymentLinks.create({
    line_items: [{
      quantity: 1,
      price_data: { currency: 'usd', unit_amount: req.amountCents, product_data: { name: `Event rentals · ${req.label}` } },
    }],
    application_fee_amount: req.applicationFeeCents,
    metadata,
    payment_intent_data: { metadata },
    restrictions: { completed_sessions: { limit: 1 } },
    after_completion: { type: 'redirect', redirect: { url: `${siteUrl()}/account/event?paid=1` } },
  }, { stripeAccount: req.connectedAccountId, idempotencyKey: `cart-link-${req.paymentId}` })
  return { providerRef: link.id, url: link.url }
}

export async function cancelClientPayment(providerRef: string, connectedAccountId: string | null): Promise<void> {
  await requireStripe().paymentLinks.update(providerRef, { active: false }, connectedAccountId ? { stripeAccount: connectedAccountId } : undefined)
}

/** Refund on the connected account; Prime Lux's fee is refunded in the same proportion. */
export async function refundClientPayment(input: { paymentIntentId: string; connectedAccountId: string; amountCents: number; paymentId: string; nonce: string }) {
  return requireStripe().refunds.create({
    payment_intent: input.paymentIntentId,
    amount: input.amountCents,
    refund_application_fee: true,
    metadata: { planner_cart_payment_id: input.paymentId },
  }, { stripeAccount: input.connectedAccountId, idempotencyKey: `cart-refund-${input.paymentId}-${input.nonce}` })
}
