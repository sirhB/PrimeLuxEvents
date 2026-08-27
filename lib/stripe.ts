import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2025-11-17.clover',
    })
    : null

export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

/** True only when explicitly allowed (local/dev). Never in production. */
export function allowMockPayments(): boolean {
    if (process.env.NODE_ENV === 'production') return false
    return process.env.ALLOW_MOCK_PAYMENTS === 'true'
}

export function requireStripe(): Stripe {
    if (!stripe) {
        throw new Error(
            'Stripe is not configured. Set STRIPE_SECRET_KEY (and matching publishable key) before accepting payments.',
        )
    }
    return stripe
}

/** Dev-only mock PaymentIntent. Throws in production or when mocks are disabled. */
export async function createMockPaymentIntent(amount: number) {
    if (!allowMockPayments()) {
        throw new Error(
            'Mock payments are disabled. Configure STRIPE_SECRET_KEY or set ALLOW_MOCK_PAYMENTS=true for local development only.',
        )
    }
    return {
        id: `pi_mock_${Date.now()}`,
        client_secret: 'mock_secret',
        amount,
        status: 'requires_payment_method' as const,
    }
}

export function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(cents / 100)
}
