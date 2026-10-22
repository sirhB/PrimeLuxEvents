import { requireStripe } from '@/lib/stripe'
import { MEMBERSHIP_PRICE_CENTS } from './policy'

const LOOKUP_KEY = 'planner_membership_monthly'

/**
 * Price for the $99/mo membership. Uses STRIPE_PRICE_PLANNER_MEMBERSHIP when set; otherwise
 * finds (or creates once) a recurring price with lookup_key `planner_membership_monthly`.
 */
export async function membershipPriceId(): Promise<string> {
  const configured = process.env.STRIPE_PRICE_PLANNER_MEMBERSHIP
  if (configured) return configured
  const stripe = requireStripe()
  const found = await stripe.prices.list({ lookup_keys: [LOOKUP_KEY], active: true, limit: 1 })
  if (found.data[0]) return found.data[0].id
  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: MEMBERSHIP_PRICE_CENTS,
    recurring: { interval: 'month' },
    lookup_key: LOOKUP_KEY,
    product_data: { name: 'Prime Lux Planner Membership' },
  }, { idempotencyKey: `price-${LOOKUP_KEY}` })
  return price.id
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}
