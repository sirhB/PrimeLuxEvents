'use server'

import { stripe, allowMockPayments, createMockPaymentIntent } from '@/lib/stripe'
import {
    calculateOrderTotal,
    type CartItem,
    type FulfillmentMethod,
} from './checkout'
import { createClient } from '@/lib/supabase/server'
import { userOwnsOrder } from '@/lib/orders/ownership'
import { isStaffUser } from '@/lib/auth/roles'
import { clampCheckoutAmount } from '@/lib/security/checkout-amounts'
import { checkRateLimit, clientIpFromHeaders } from '@/lib/security/rate-limit'
import { headers } from 'next/headers'

export type CreateCheckoutPaymentIntentsResult = {
    clientSecret?: string | null
    paymentIntentId?: string
    amount?: number
    depositClientSecret?: string | null
    depositPaymentIntentId?: string | null
    depositAmount?: number
    error?: string
}

/**
 * Create two separate PaymentIntents: order total (or ≥50% deposit) + refundable security deposit.
 * Keeping them separate makes deposit refunds independent of the rental charge.
 */
export async function createCheckoutPaymentIntents(
    items: CartItem[],
    deliveryAddress: string,
    customAmount?: number,
    fulfillmentMethod: FulfillmentMethod = 'delivery',
): Promise<CreateCheckoutPaymentIntentsResult> {
    try {
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

        const method: FulfillmentMethod =
            fulfillmentMethod === 'customer_pickup' ? 'customer_pickup' : 'delivery'

        const totals = await calculateOrderTotal(items, deliveryAddress, {
            fulfillmentMethod: method,
        })
        if (totals.totalAmount <= 0) {
            return { error: 'Cart total is invalid' }
        }

        const { amount: finalAmount, isPartial } = clampCheckoutAmount(
            customAmount,
            totals.totalAmount,
        )
        const depositAmount = Math.max(0, totals.securityDepositCents || 0)

        if (!stripe) {
            if (!allowMockPayments()) {
                return { error: 'Stripe is not configured' }
            }
            const orderMock = await createMockPaymentIntent(finalAmount)
            const depositMock =
                depositAmount > 0 ? await createMockPaymentIntent(depositAmount) : null
            return {
                clientSecret: orderMock.client_secret,
                paymentIntentId: orderMock.id,
                amount: finalAmount,
                depositClientSecret: depositMock?.client_secret ?? null,
                depositPaymentIntentId: depositMock?.id ?? null,
                depositAmount,
            }
        }

        const orderIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                itemCount: items.length.toString(),
                isPartial: isPartial ? 'true' : 'false',
                totalAmount: totals.totalAmount.toString(),
                paymentType: 'order',
                fulfillmentMethod: method,
            },
        })

        let depositClientSecret: string | null = null
        let depositPaymentIntentId: string | null = null

        if (depositAmount > 0) {
            const depositIntent = await stripe.paymentIntents.create({
                amount: depositAmount,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    paymentType: 'security_deposit',
                    depositAmount: depositAmount.toString(),
                    orderTotalAmount: totals.totalAmount.toString(),
                    fulfillmentMethod: method,
                },
            })
            depositClientSecret = depositIntent.client_secret
            depositPaymentIntentId = depositIntent.id
        }

        return {
            clientSecret: orderIntent.client_secret,
            paymentIntentId: orderIntent.id,
            amount: finalAmount,
            depositClientSecret,
            depositPaymentIntentId,
            depositAmount,
        }
    } catch (error) {
        console.error('Error creating checkout payment intents:', error)
        return {
            error: error instanceof Error ? error.message : 'Failed to create payment intent',
        }
    }
}

/** @deprecated Prefer createCheckoutPaymentIntents — kept for callers that only need the order PI */
export async function createPaymentIntent(
    items: CartItem[],
    deliveryAddress: string,
    customAmount?: number,
) {
    const result = await createCheckoutPaymentIntents(items, deliveryAddress, customAmount, 'delivery')
    if (result.error) {
        return { error: result.error }
    }
    return {
        clientSecret: result.clientSecret,
        amount: result.amount,
        depositClientSecret: result.depositClientSecret,
        depositPaymentIntentId: result.depositPaymentIntentId,
        depositAmount: result.depositAmount,
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
