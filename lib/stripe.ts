import Stripe from 'stripe'

// Initialize Stripe with API key from environment
// For now, this will be undefined until you add STRIPE_SECRET_KEY
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-11-17.clover',
    })
    : null

export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''


// Mock payment intent for development without API key
export async function createMockPaymentIntent(amount: number) {
    return {
        id: `pi_mock_${Date.now()}`,
        client_secret: 'mock_secret',
        amount,
        status: 'requires_payment_method' as const,
    }
}

// Helper to format amount in cents to dollars
export function formatCurrency(cents: number): string {
    const amount = typeof cents === 'number' && Number.isFinite(cents) ? cents : 0
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount / 100)
}
