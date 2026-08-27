'use server'

import { stripe } from '@/lib/stripe'
import { calculateOrderTotal, type CartItem } from './checkout'
import { createClient } from '@/lib/supabase/server'
import { userOwnsOrder } from '@/lib/orders/ownership'
import { isStaffUser } from '@/lib/auth/roles'

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

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { error: 'You must be signed in to pay a balance' }
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, user_id, customer_email, total_amount, balance_paid, payment_status, client_can_pay, billing_party')
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return { error: 'Order not found' }
        }

        const staff = await isStaffUser(user.id)
        if (!staff && !userOwnsOrder(user, order)) {
            return { error: 'You do not have permission to pay this order' }
        }

        // Partner settle-up orders: end clients must not pay PrimeLux directly
        if (order.client_can_pay === false && !staff && order.user_id !== user.id) {
            return {
                error: 'Payment for this booking is handled by your planner with PrimeLux directly.',
            }
        }

        const remaining = Math.max(0, (order.total_amount || 0) - (order.balance_paid || 0))
        if (amount <= 0 || amount > remaining) {
            return { error: 'Invalid payment amount' }
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId,
                paymentType:
                    order.billing_party === 'partner' ? 'partner_trade_balance' : 'balance_payment',
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
