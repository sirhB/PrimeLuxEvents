'use server'

import { stripe } from '@/lib/stripe'
import { calculateOrderTotal, type CartItem } from './checkout'

export async function createPaymentIntent(items: CartItem[], deliveryAddress: string) {
    try {
        if (!stripe) {
            throw new Error('Stripe is not configured')
        }

        // Calculate the total amount
        const totals = await calculateOrderTotal(items, deliveryAddress)

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totals.totalAmount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                // You can add more metadata here, like customer info or item IDs
                itemCount: items.length.toString(),
            },
        })

        return {
            clientSecret: paymentIntent.client_secret,
            amount: totals.totalAmount,
        }
    } catch (error) {
        console.error('Error creating payment intent:', error)
        return {
            error: error instanceof Error ? error.message : 'Failed to create payment intent',
        }
    }
}
