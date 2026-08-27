'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { calculateOrderTotal, createOrder, type CartItem, type CheckoutFormData } from '@/app/actions/checkout'
import {
  assignPartnerRole,
  getPartnerProfileForUser,
  removePartnerRole,
  requireActivePartner,
  type PartnerBusinessType,
  type PartnerTier,
} from '@/lib/auth/partners'
import { requirePermission } from '@/lib/auth/authorization'
import { stripe } from '@/lib/stripe'
import { randomBytes } from 'crypto'

const applySchema = z.object({
  companyName: z.string().min(2).max(200),
  businessType: z.enum(['planner', 'decorator', 'designer', 'other']),
  phone: z.string().min(7).max(40),
  website: z.string().max(300).optional().or(z.literal('')),
  instagram: z.string().max(100).optional().or(z.literal('')),
})

const shareCartSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientPhone: z.string().max(40).optional().or(z.literal('')),
  title: z.string().max(200).optional().or(z.literal('')),
  eventDate: z.string().optional().or(z.literal('')),
  eventType: z.string().max(100).optional().or(z.literal('')),
  venueAddress: z.string().max(500).optional().or(z.literal('')),
  deliveryAddress: z.string().min(1).max(500),
  deliveryDate: z.string().optional().or(z.literal('')),
  deliveryTime: z.string().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  items: z.array(z.any()).min(1),
})

function makeShareToken() {
  return randomBytes(18).toString('base64url')
}

export async function applyToPartnerProgram(input: z.infer<typeof applySchema>) {
  const parsed = applySchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Please check the form and try again.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to apply.' }

  const existing = await getPartnerProfileForUser(user.id)
  if (existing) {
    return { error: 'You already have a partner application on file.' }
  }

  const { data, error } = await supabase
    .from('partner_profiles')
    .insert({
      user_id: user.id,
      company_name: parsed.data.companyName.trim(),
      business_type: parsed.data.businessType as PartnerBusinessType,
      phone: parsed.data.phone.trim(),
      website: parsed.data.website || null,
      instagram: parsed.data.instagram || null,
      status: 'pending',
      tier: 'preferred',
    })
    .select()
    .single()

  if (error) {
    console.error('Partner apply error:', error)
    return { error: 'Could not submit application. Please try again.' }
  }

  revalidatePath('/account/partner')
  return { success: true, profile: data }
}

export async function createSharedCartForClient(input: z.infer<typeof shareCartSchema>) {
  try {
    const partner = await requireActivePartner()
    const parsed = shareCartSchema.safeParse(input)
    if (!parsed.success) {
      return { error: 'Missing required cart or client details.' }
    }

    const items = parsed.data.items as CartItem[]
    const deliveryAddress = parsed.data.deliveryAddress.trim()

    // Trade totals (partner session → discounts apply)
    const trade = await calculateOrderTotal(items, deliveryAddress)

    // Retail totals: merchandise without partner discount
    const retailSubtotal = trade.subtotal
    const retailSetup = trade.setupFee
    const retailDelivery = trade.deliveryFee
    const retailTax = Math.round((retailSubtotal + retailSetup) * trade.taxRate)
    const retailTotal = retailSubtotal + retailSetup + retailTax + retailDelivery

    const shareToken = makeShareToken()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('partner_shared_carts')
      .insert({
        partner_id: partner.id,
        share_token: shareToken,
        title: parsed.data.title?.trim() || `${parsed.data.clientName}'s selection`,
        client_name: parsed.data.clientName.trim(),
        client_email: parsed.data.clientEmail?.trim() || null,
        client_phone: parsed.data.clientPhone?.trim() || null,
        event_date: parsed.data.eventDate || null,
        event_type: parsed.data.eventType || null,
        venue_address: parsed.data.venueAddress || null,
        delivery_address: deliveryAddress,
        delivery_date: parsed.data.deliveryDate || null,
        delivery_time: parsed.data.deliveryTime || null,
        notes: parsed.data.notes || null,
        items,
        retail_subtotal: retailSubtotal,
        retail_setup_fee: retailSetup,
        retail_tax_amount: retailTax,
        retail_delivery_fee: retailDelivery,
        retail_total: retailTotal,
        trade_discount_amount: trade.discountAmount,
        trade_discount_name: trade.discountName || null,
        trade_subtotal: Math.max(0, trade.subtotal - trade.discountAmount),
        trade_tax_amount: trade.taxAmount,
        trade_total: trade.totalAmount,
        tax_rate: trade.taxRate,
        status: 'shared',
        shared_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('createSharedCart error:', error)
      return { error: 'Could not create shareable cart.' }
    }

    revalidatePath('/account/partner/carts')
    return {
      success: true,
      cart: data,
      sharePath: `/share/${shareToken}`,
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create shared cart' }
  }
}

export async function getSharedCartByToken(token: string) {
  if (!token || token.length < 8) return { error: 'Invalid link' }

  const admin = createServiceClient()
  const { data: cart, error } = await admin
    .from('partner_shared_carts')
    .select('*')
    .eq('share_token', token)
    .maybeSingle()

  if (error || !cart) return { error: 'This selection could not be found.' }
  if (!['shared', 'accepted', 'settled'].includes(cart.status)) {
    return { error: 'This selection is no longer available.' }
  }
  if (cart.expires_at && new Date(cart.expires_at) < new Date() && cart.status !== 'settled') {
    return { error: 'This selection link has expired. Ask your planner for an updated link.' }
  }

  const { data: partner } = await admin
    .from('partner_profiles')
    .select(
      'company_name, business_type, website, instagram, payment_zelle, payment_venmo, payment_apple_cash, payment_cash_app, payment_other_label, payment_other_value, payment_instructions, phone',
    )
    .eq('id', cart.partner_id)
    .maybeSingle()

  // Enrich items with product names/images for display (retail view)
  const items = (cart.items || []) as CartItem[]
  const productIds = items.filter((i) => i.productId).map((i) => i.productId as string)
  let products: any[] = []
  if (productIds.length > 0) {
    const { data } = await admin
      .from('products')
      .select('id, name, image_url, price_cents, price')
      .in('id', productIds)
    products = data || []
  }

  return {
    cart: {
      id: cart.id,
      title: cart.title,
      client_name: cart.client_name,
      event_date: cart.event_date,
      event_type: cart.event_type,
      venue_address: cart.venue_address,
      notes: cart.notes,
      status: cart.status,
      items,
      // Client-facing: retail only — never expose trade totals
      retail_subtotal: cart.retail_subtotal,
      retail_setup_fee: cart.retail_setup_fee,
      retail_tax_amount: cart.retail_tax_amount,
      retail_delivery_fee: cart.retail_delivery_fee,
      retail_total: cart.retail_total,
      shared_at: cart.shared_at,
    },
    partner,
    products,
    // Explicit flag for UI
    clientCanPay: false,
  }
}

export async function listPartnerSharedCarts() {
  try {
    const partner = await requireActivePartner()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('partner_shared_carts')
      .select('*')
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })

    if (error) return { error: error.message, carts: [] }
    return { carts: data || [] }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed', carts: [] }
  }
}

export async function getPartnerSharedCart(id: string) {
  try {
    const partner = await requireActivePartner()
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('partner_shared_carts')
      .select('*')
      .eq('id', id)
      .eq('partner_id', partner.id)
      .maybeSingle()

    if (error || !data) return { error: 'Cart not found' }
    return { cart: data }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed' }
  }
}

export async function createPartnerSettlePaymentIntent(sharedCartId: string) {
  try {
    const partner = await requireActivePartner()
    if (!stripe) return { error: 'Stripe is not configured' }

    const supabase = await createClient()
    const { data: cart, error } = await supabase
      .from('partner_shared_carts')
      .select('*')
      .eq('id', sharedCartId)
      .eq('partner_id', partner.id)
      .maybeSingle()

    if (error || !cart) return { error: 'Shared cart not found' }
    if (cart.status === 'settled' || cart.order_id) {
      return { error: 'This selection has already been settled with PrimeLux.' }
    }
    if (!['shared', 'accepted'].includes(cart.status)) {
      return { error: 'This cart cannot be settled in its current state.' }
    }

    const amount = cart.trade_total
    if (!amount || amount <= 0) return { error: 'Invalid trade total' }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        paymentType: 'partner_trade_settle',
        sharedCartId: cart.id,
        partnerId: partner.id,
        retailTotal: String(cart.retail_total),
        tradeTotal: String(cart.trade_total),
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      amount,
      paymentIntentId: paymentIntent.id,
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to start payment' }
  }
}

/**
 * Partner pays PrimeLux the trade portion after collecting retail from their client externally.
 */
export async function settleSharedCartWithPrimeLux(input: {
  sharedCartId: string
  paymentIntentId: string
  signatureUrl?: string
}) {
  try {
    const partner = await requireActivePartner()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not signed in' }

    const { data: cart, error } = await supabase
      .from('partner_shared_carts')
      .select('*')
      .eq('id', input.sharedCartId)
      .eq('partner_id', partner.id)
      .maybeSingle()

    if (error || !cart) return { error: 'Shared cart not found' }
    if (cart.status === 'settled' || cart.order_id) {
      return { error: 'Already settled' }
    }

    const items = (cart.items || []) as CartItem[]
    const formData: CheckoutFormData = {
      customerName: partner.company_name,
      // Partner email for order ownership — NOT the end client
      customerEmail: user.email || '',
      customerPhone: partner.phone || '',
      deliveryAddress: cart.delivery_address || cart.venue_address || '',
      deliveryDate: cart.delivery_date || cart.event_date || new Date().toISOString().slice(0, 10),
      deliveryTime: cart.delivery_time || '09:00',
      deliveryNotes: [
        cart.notes,
        `Client: ${cart.client_name}`,
        cart.client_email ? `Client email: ${cart.client_email}` : null,
        cart.client_phone ? `Client phone: ${cart.client_phone}` : null,
        'Billing: Partner settle-up (client paid partner externally)',
      ]
        .filter(Boolean)
        .join('\n'),
      eventDate: cart.event_date || cart.delivery_date || new Date().toISOString().slice(0, 10),
      eventType: cart.event_type || 'Partner booking',
      venueAddress: cart.venue_address || cart.delivery_address || '',
      sameDayPickup: cart.same_day_pickup || false,
      pickupDate: cart.pickup_date || undefined,
      pickupTime: cart.pickup_time || undefined,
    }

    const result = await createOrder(
      formData,
      items,
      input.paymentIntentId,
      input.signatureUrl,
      cart.trade_total,
    )

    if (!result?.success || !result.orderId) {
      return { error: result?.error || 'Failed to create order' }
    }

    const admin = createServiceClient()
    await admin
      .from('orders')
      .update({
        partner_id: partner.id,
        partner_shared_cart_id: cart.id,
        billing_party: 'partner',
        client_can_pay: false,
        discount_total: cart.trade_discount_amount,
        discount_name: cart.trade_discount_name,
      })
      .eq('id', result.orderId)

    await admin
      .from('partner_shared_carts')
      .update({
        status: 'settled',
        order_id: result.orderId,
        settled_at: new Date().toISOString(),
      })
      .eq('id', cart.id)

    revalidatePath('/account/partner/carts')
    revalidatePath('/account/orders')
    return { success: true, orderId: result.orderId }
  } catch (e) {
    console.error('settleSharedCart error:', e)
    return { error: e instanceof Error ? e.message : 'Settlement failed' }
  }
}

export async function cancelSharedCart(id: string) {
  try {
    const partner = await requireActivePartner()
    const supabase = await createClient()
    const { error } = await supabase
      .from('partner_shared_carts')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('partner_id', partner.id)
      .in('status', ['draft', 'shared', 'accepted'])

    if (error) return { error: error.message }
    revalidatePath('/account/partner/carts')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed' }
  }
}

const paymentMethodsSchema = z.object({
  payment_zelle: z.string().max(200).optional().or(z.literal('')),
  payment_venmo: z.string().max(200).optional().or(z.literal('')),
  payment_apple_cash: z.string().max(200).optional().or(z.literal('')),
  payment_cash_app: z.string().max(200).optional().or(z.literal('')),
  payment_other_label: z.string().max(80).optional().or(z.literal('')),
  payment_other_value: z.string().max(200).optional().or(z.literal('')),
  payment_instructions: z.string().max(2000).optional().or(z.literal('')),
})

/** Partner saves how clients should pay them (shown on share invoice). */
export async function updatePartnerPaymentMethods(input: z.infer<typeof paymentMethodsSchema>) {
  try {
    const partner = await requireActivePartner()
    const parsed = paymentMethodsSchema.safeParse(input)
    if (!parsed.success) return { error: 'Invalid payment details' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('partner_profiles')
      .update({
        payment_zelle: parsed.data.payment_zelle?.trim() || null,
        payment_venmo: parsed.data.payment_venmo?.trim() || null,
        payment_apple_cash: parsed.data.payment_apple_cash?.trim() || null,
        payment_cash_app: parsed.data.payment_cash_app?.trim() || null,
        payment_other_label: parsed.data.payment_other_label?.trim() || null,
        payment_other_value: parsed.data.payment_other_value?.trim() || null,
        payment_instructions: parsed.data.payment_instructions?.trim() || null,
      })
      .eq('id', partner.id)

    if (error) {
      console.error('updatePartnerPaymentMethods:', error)
      return { error: 'Could not save payment methods' }
    }

    revalidatePath('/account/partner/payments')
    revalidatePath('/account/partner')
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed' }
  }
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function adminListPartners() {
  await requirePermission('customers.view')
  const admin = createServiceClient()
  const { data, error } = await admin
    .from('partner_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, partners: [] }
  return { partners: data || [] }
}

export async function adminUpdatePartnerStatus(input: {
  partnerId: string
  status: 'pending' | 'active' | 'suspended' | 'revoked'
  tier?: PartnerTier
  baseDiscountPercent?: number | null
  notes?: string
}) {
  await requirePermission('customers.view')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createServiceClient()

  const { data: existing } = await admin
    .from('partner_profiles')
    .select('*')
    .eq('id', input.partnerId)
    .maybeSingle()

  if (!existing) return { error: 'Partner not found' }

  const updates: Record<string, unknown> = {
    status: input.status,
  }
  if (input.tier) updates.tier = input.tier
  if (input.baseDiscountPercent !== undefined) {
    updates.base_discount_percent = input.baseDiscountPercent
  }
  if (input.notes !== undefined) updates.notes = input.notes

  if (input.status === 'active' && existing.status !== 'active') {
    updates.approved_at = new Date().toISOString()
    updates.approved_by = user?.id ?? null
    await assignPartnerRole(existing.user_id)
  }

  if (['suspended', 'revoked'].includes(input.status)) {
    await removePartnerRole(existing.user_id)
  }

  const { error } = await admin
    .from('partner_profiles')
    .update(updates)
    .eq('id', input.partnerId)

  if (error) return { error: error.message }

  revalidatePath('/admin/partners')
  return { success: true }
}
