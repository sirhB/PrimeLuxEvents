'use server'

import { stripe } from '@/lib/stripe'
import { calculateOrderTotal, type CartItem } from './checkout'
import { createClient } from '@/lib/supabase/server'
import { userOwnsOrder } from '@/lib/orders/ownership'
import { isStaffUser } from '@/lib/auth/roles'
import { clampCheckoutAmount } from '@/lib/security/checkout-amounts'
import { checkRateLimit, clientIpFromHeaders } from '@/lib/security/rate-limit'
import { headers } from 'next/headers'

export async function createPaymentIntent(items: CartItem[], deliveryAddress: string, customAmount?: number) {
    try {
        if (!stripe) {
            throw new Error('Stripe is not configured')
        }

        if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
            return { error: 'Invalid cart' }
        }
        if (typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 3) {
            return { error: 'Delivery address is required' }
        }

        const hdrs = await headers()
        const ip = clientIpFromHeaders(hdrs)
        const rate = checkRateLimit(`payment-intent:${ip}`, 15, 60_000)
        if (!rate.allowed) {
            return { error: 'Too many payment attempts. Please try again shortly.' }
        }

        // Server-computed total from DB prices — ignore client package prices
        const totals = await calculateOrderTotal(items, deliveryAddress)
        if (totals.totalAmount <= 0) {
            return { error: 'Cart total is invalid' }
        }

        const { amount: finalAmount, isPartial } = clampCheckoutAmount(customAmount, totals.totalAmount)

        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                itemCount: items.length.toString(),
                isPartial: isPartial ? 'true' : 'false',
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

        const hdrs = await headers()
        const rate = checkRateLimit(`balance-pi:${user.id}`, 15, 60_000)
        if (!rate.allowed) {
            return { error: 'Too many payment attempts. Please try again shortly.' }
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
        if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
            return { error: 'Invalid payment amount' }
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
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
            amount: Math.round(amount),
        }
    } catch (error) {
        console.error('Error creating balance payment intent:', error)
        return {
            error: error instanceof Error ? error.message : 'Failed to create payment intent',
        }
    }
}
