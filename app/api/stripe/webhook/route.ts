import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { headers } from 'next/headers'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event

    try {
        if (!stripe) {
            throw new Error('Stripe is not configured')
        }
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set')
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Service role: webhook has no user session and must update orders/payments despite RLS
    const supabase = createServiceRoleClient()

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object
            const paymentType = paymentIntent.metadata?.paymentType

            // --- Security deposit: separate charge; never apply to balance_paid ---
            if (paymentType === 'security_deposit') {
                let { data: depositOrder } = await supabase
                    .from('orders')
                    .select('id, security_deposit_status')
                    .eq('security_deposit_payment_intent_id', paymentIntent.id)
                    .maybeSingle()

                if (!depositOrder && paymentIntent.metadata?.orderId) {
                    const { data: byMeta } = await supabase
                        .from('orders')
                        .select('id, security_deposit_status')
                        .eq('id', paymentIntent.metadata.orderId)
                        .maybeSingle()
                    depositOrder = byMeta
                }

                if (!depositOrder) {
                    // Order may not exist yet (PI succeeded before createOrder) — ack and retry later via createOrder verify
                    console.warn('Security deposit PI succeeded before order row existed:', paymentIntent.id)
                    return NextResponse.json({ received: true, pendingOrder: true })
                }

                const { data: existingPayment } = await supabase
                    .from('payments')
                    .select('id')
                    .eq('stripe_payment_intent_id', paymentIntent.id)
                    .maybeSingle()

                if (existingPayment) {
                    return NextResponse.json({ received: true, duplicate: true })
                }

                const amountReceived = paymentIntent.amount_received || paymentIntent.amount || 0

                await supabase
                    .from('orders')
                    .update({
                        security_deposit_status: 'held',
                        security_deposit_amount: amountReceived,
                        security_deposit_payment_intent_id: paymentIntent.id,
                    })
                    .eq('id', depositOrder.id)

                await supabase.from('payments').insert({
                    order_id: depositOrder.id,
                    amount: amountReceived,
                    payment_method: 'security_deposit',
                    payment_status: 'succeeded',
                    stripe_payment_intent_id: paymentIntent.id,
                })

                break
            }

            // --- Order / balance payments ---
            let { data: order, error: fetchError } = await supabase
                .from('orders')
                .select('id, total_amount, balance_paid')
                .eq('payment_intent_id', paymentIntent.id)
                .single()

            if (fetchError || !order) {
                const orderIdFromMetadata = paymentIntent.metadata?.orderId
                if (orderIdFromMetadata) {
                    const { data: orderMeta, error: metaError } = await supabase
                        .from('orders')
                        .select('id, total_amount, balance_paid')
                        .eq('id', orderIdFromMetadata)
                        .single()

                    if (!metaError && orderMeta) {
                        order = orderMeta
                        fetchError = null
                    }
                }
            }

            // Guard: never treat a deposit PI as an order payment via mistaken lookup
            if (order) {
                const { data: asDeposit } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('id', order.id)
                    .eq('security_deposit_payment_intent_id', paymentIntent.id)
                    .maybeSingle()
                if (asDeposit) {
                    console.warn('Skipping balance update for security deposit PI', paymentIntent.id)
                    return NextResponse.json({ received: true })
                }
            }

            if (fetchError || !order) {
                console.error('Error fetching order for webhook:', fetchError)
                return NextResponse.json({ error: 'Order not found' }, { status: 404 })
            }

            // Idempotency: skip if this PaymentIntent was already recorded
            const { data: existingPayment } = await supabase
                .from('payments')
                .select('id')
                .eq('stripe_payment_intent_id', paymentIntent.id)
                .maybeSingle()

            if (existingPayment) {
                return NextResponse.json({ received: true, duplicate: true })
            }

            const amountReceived = paymentIntent.amount_received || paymentIntent.amount || 0
            if (amountReceived <= 0) {
                return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
            }

            // Cap so a single PI cannot inflate balance beyond order total in one shot;
            // remaining balance is computed from prior balance_paid.
            const priorPaid = order.balance_paid || 0
            const remaining = Math.max(0, (order.total_amount || 0) - priorPaid)
            const applied = Math.min(amountReceived, remaining || amountReceived)
            const newBalancePaid = priorPaid + applied
            const newStatus = newBalancePaid >= order.total_amount ? 'paid' : 'partially_paid'

            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_status: newStatus,
                    balance_paid: newBalancePaid,
                    status: 'confirmed'
                })
                .eq('id', order.id)

            if (updateError) {
                console.error('Error updating order status:', updateError)
                return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
            }

            await supabase
                .from('payments')
                .insert({
                    order_id: order.id,
                    amount: applied,
                    payment_method: paymentIntent.payment_method_types?.[0],
                    payment_status: 'succeeded',
                    stripe_payment_intent_id: paymentIntent.id
                })
            break
        }

        case 'payment_intent.payment_failed': {
            const failedIntent = event.data.object
            const failedType = failedIntent.metadata?.paymentType

            if (failedType === 'security_deposit') {
                await supabase
                    .from('orders')
                    .update({ security_deposit_status: 'none' })
                    .eq('security_deposit_payment_intent_id', failedIntent.id)
                break
            }

            await supabase
                .from('orders')
                .update({ payment_status: 'failed' })
                .eq('payment_intent_id', failedIntent.id)
            break
        }

        default:
            break
    }

    return NextResponse.json({ received: true })
}
