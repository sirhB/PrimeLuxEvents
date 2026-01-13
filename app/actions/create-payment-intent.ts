'use server'

import { stripe } from '@/lib/stripe'
import { calculateOrderTotal, type CartItem } from './checkout'

export async function createPaymentIntent(items: CartItem[], deliveryAddress: string, customAmount?: number) {
    try {
        if (!stripe) {
            throw new Error('Stripe is not configured')
        }

        // Calculate the total amount
        const totals = await calculateOrderTotal(items, deliveryAddress)
        const finalAmount = customAmount ?? totals.totalAmount

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                // You can add more metadata here, like customer info or item IDs
                itemCount: items.length.toString(),
                isPartial: (customAmount && customAmount < totals.totalAmount) ? 'true' : 'false',
                totalAmount: totals.totalAmount.toString(),
            },
        })

        return {
            clientSecret: paymentIntent.client_secret,
            amount: finalAmount,
        }
    } catch (error) {
        console.error('Error creating payment intent:', error)
        return {
            error: error instanceof Error ? error.message : 'Failed to create payment intent',
        }
    }
}

export async function createBalancePaymentIntent(orderId: string, amount: number) {
    try {
        if (!stripe) {
            throw new Error('Stripe is not configured')
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId,
                paymentType: 'balance_payment'
            },
        })

        return {
            clientSecret: paymentIntent.client_secret,
            amount,
        }
    } catch (error) {
        console.error('Error creating balance payment intent:', error)
        return {
            error: error instanceof Error ? error.message : 'Failed to create payment intent',
        }
    }
}
