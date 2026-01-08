import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set')
        }
        event = stripe?.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    if (!event) {
        return NextResponse.json({ error: 'Event construction failed' }, { status: 400 })
    }

    const supabase = await createClient()

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`)

            // First, get the current order to calculate new balance
            let { data: order, error: fetchError } = await supabase
                .from('orders')
                .select('id, total_amount, balance_paid')
                .eq('payment_intent_id', paymentIntent.id)
                .single()

            // If not found by ID, check metadata (for balance payments)
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

            if (fetchError || !order) {
                console.error('Error fetching order for webhook:', fetchError)
                return NextResponse.json({ error: 'Order not found' }, { status: 404 })
            }

            const newBalancePaid = (order.balance_paid || 0) + paymentIntent.amount_received
            const newStatus = newBalancePaid >= order.total_amount ? 'paid' : 'partially_paid'

            // Update order status and balance
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

            // Record the payment
            await supabase
                .from('payments')
                .insert({
                    order_id: order.id,
                    amount: paymentIntent.amount_received,
                    payment_method: paymentIntent.payment_method_types?.[0],
                    payment_status: 'succeeded',
                    stripe_payment_intent_id: paymentIntent.id
                })
            break

        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object
            console.log(`PaymentIntent for ${failedIntent.amount} failed.`)

            // Update order status in database
            await supabase
                .from('orders')
                .update({ payment_status: 'failed' })
                .eq('payment_intent_id', failedIntent.id)
            break

        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
}
