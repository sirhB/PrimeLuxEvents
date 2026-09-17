'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { isStaffUser } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'

/**
 * Refund the refundable security deposit for an order (separate Stripe PaymentIntent).
 */
export async function refundSecurityDeposit(orderId: string, amountCents?: number) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user || !(await isStaffUser(user.id))) {
            return { success: false, error: 'Unauthorized' }
        }

        if (!stripe) {
            return { success: false, error: 'Stripe is not configured' }
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select(
                'id, security_deposit_amount, security_deposit_payment_intent_id, security_deposit_status',
            )
            .eq('id', orderId)
            .single()

        if (error || !order) {
            return { success: false, error: 'Order not found' }
        }

        if (!order.security_deposit_payment_intent_id || order.security_deposit_amount <= 0) {
            return { success: false, error: 'No security deposit on this order' }
        }

        if (order.security_deposit_status === 'refunded') {
            return { success: false, error: 'Deposit already refunded' }
        }

        if (order.security_deposit_status !== 'held' && order.security_deposit_status !== 'partially_refunded') {
            return { success: false, error: 'Deposit is not in a refundable state' }
        }

        const refundAmount =
            typeof amountCents === 'number' && Number.isFinite(amountCents) && amountCents > 0
                ? Math.min(Math.round(amountCents), order.security_deposit_amount)
                : order.security_deposit_amount

        const refund = await stripe.refunds.create({
            payment_intent: order.security_deposit_payment_intent_id,
            amount: refundAmount,
            reason: 'requested_by_customer',
            metadata: {
                orderId,
                type: 'security_deposit_refund',
            },
        })

        const fullyRefunded = refundAmount >= order.security_deposit_amount

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                security_deposit_status: fullyRefunded ? 'refunded' : 'partially_refunded',
                security_deposit_refunded_at: new Date().toISOString(),
                security_deposit_refund_id: refund.id,
            })
            .eq('id', orderId)

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        revalidatePath(`/admin/orders/${orderId}`)
        revalidatePath('/admin/orders')
        return { success: true, refundId: refund.id, amount: refundAmount }
    } catch (err) {
        console.error('refundSecurityDeposit:', err)
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to refund deposit',
        }
    }
}

export type UpdatePickupScheduleInput = {
    fulfillmentMethod?: 'delivery' | 'customer_pickup'
    /** Customer warehouse pickup window (stored on delivery_date/time for pickup orders) */
    pickupDate?: string
    pickupTime?: string
    returnDate?: string
    returnTime?: string
    /** Vendor return pickup after delivery events */
    vendorPickupDate?: string
    vendorPickupTime?: string
    confirm?: boolean
}

/**
 * Manager: confirm or change customer pickup & return times.
 */
export async function updatePickupSchedule(orderId: string, input: UpdatePickupScheduleInput) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user || !(await isStaffUser(user.id))) {
            return { success: false, error: 'Unauthorized' }
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select('id, fulfillment_method')
            .eq('id', orderId)
            .single()

        if (error || !order) {
            return { success: false, error: 'Order not found' }
        }

        const updateData: Record<string, unknown> = {}

        if (input.fulfillmentMethod) {
            updateData.fulfillment_method = input.fulfillmentMethod
        }

        const method =
            input.fulfillmentMethod ||
            (order.fulfillment_method as string) ||
            'delivery'

        if (method === 'customer_pickup') {
            if (input.pickupDate !== undefined) updateData.delivery_date = input.pickupDate
            if (input.pickupTime !== undefined) updateData.delivery_time = input.pickupTime
            if (input.returnDate !== undefined) updateData.return_date = input.returnDate
            if (input.returnTime !== undefined) updateData.return_time = input.returnTime
        } else {
            if (input.pickupDate !== undefined) updateData.delivery_date = input.pickupDate
            if (input.pickupTime !== undefined) updateData.delivery_time = input.pickupTime
            if (input.vendorPickupDate !== undefined) updateData.pickup_date = input.vendorPickupDate
            if (input.vendorPickupTime !== undefined) updateData.pickup_time = input.vendorPickupTime
            if (input.returnDate !== undefined) updateData.return_date = input.returnDate
            if (input.returnTime !== undefined) updateData.return_time = input.returnTime
        }

        if (input.confirm) {
            updateData.pickup_confirmed = true
            updateData.pickup_confirmed_at = new Date().toISOString()
            updateData.pickup_confirmed_by = user.id
        }

        const { error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        revalidatePath(`/admin/orders/${orderId}`)
        revalidatePath('/admin/orders')
        return { success: true }
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to update schedule',
        }
    }
}
