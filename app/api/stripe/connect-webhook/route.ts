import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { handleConnectEvent } from '@/lib/connect/events'

export const dynamic = 'force-dynamic'

/**
 * Stripe Connect webhook: events on planners' connected accounts (account.updated, cart
 * checkouts, refunds, disputes). Separate endpoint + secret from the platform webhook.
 */
export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') ?? ''
  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET
  if (!stripe || !secret) return NextResponse.json({ error: 'Connect webhook not configured' }, { status: 500 })
  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 })
  }
  try {
    await handleConnectEvent(event, createServiceRoleClient())
  } catch (err) {
    console.error('Connect webhook error:', (err as Error).message)
    return NextResponse.json({ error: 'Event failed' }, { status: 500 })
  }
  return NextResponse.json({ received: true })
}
