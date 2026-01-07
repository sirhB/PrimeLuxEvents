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

            // Update order status in database
            const { error: updateError } = await supabase
                .from('orders')
                .update({
                    payment_status: 'succeeded',
                    status: 'confirmed' // Or whatever your confirmed status is
                })
                .eq('payment_intent_id', paymentIntent.id)

            if (updateError) {
                console.error('Error updating order status:', updateError)
                return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
            }
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
