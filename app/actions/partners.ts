'use server'

import { createServiceClient } from '@/lib/supabase/server'
import type { CartItem } from '@/app/actions/checkout'

/**
 * LEGACY Preferred Partner program (replaced by the planner membership).
 * Only the read path for old /share/[token] links remains; partner tables are kept readable
 * but nothing writes to them anymore.
 */
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
      `company_name, business_type, website, instagram, phone,
       payment_zelle, payment_venmo, payment_apple_cash, payment_cash_app,
       payment_other_label, payment_other_value, payment_instructions,
       brand_display_name, brand_logo_url, brand_accent_color, brand_tagline,
       business_email, business_address, business_city, business_region, business_postal,
       invoice_footer_note`,
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
