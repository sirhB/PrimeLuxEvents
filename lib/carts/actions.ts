'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { resolvePriceCents } from '@/lib/catalog/adapters'
import { calculateDeliveryFee } from '@/app/actions/checkout'
import { isEligible } from '@/lib/membership/policy'
import { cancelClientPayment, clientPaymentsEnabled, createClientPayment, refundClientPayment } from './payment-provider'
import { allocateFees, applicationFeeForPayment, isBlockedFeeLabel, primeLuxFeeCents } from './split'
import { canTakePayments, getConnectStatus } from '@/lib/connect/server'
import { planPayments, priceCart, type PlanMode } from './pricing'
import { loadCartLimits, loadEligibility, memberActiveFor, productCategories } from './load'
import type { CartItemType } from './types'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }
type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function caller() {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return null
  const { data: isAdmin } = await db.rpc('is_admin')
  return { db, user, isAdmin: Boolean(isAdmin) }
}

function touch(cartId?: string) {
  revalidatePath('/admin/carts')
  if (cartId) revalidatePath(`/admin/carts/${cartId}`)
  revalidatePath('/account/event')
  revalidatePath('/admin/members')
}

/** Planner (assigned to the event) or admin opens a cart. */
export async function createPlannerCart(leadId: string): Promise<Result<{ id: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  if (!UUID.test(leadId)) return { ok: false, error: 'Pick an event' }
  const { data: a } = await c.db.from('planner_event_assignments').select('planner_user_id').eq('lead_id', leadId).maybeSingle()
  if (!a) return { ok: false, error: 'An admin needs to assign you to this event first' }
  if (a.planner_user_id !== c.user.id && !c.isAdmin) return { ok: false, error: 'Not your client' }
  const { data: settings } = await c.db.from('settings').select('value').eq('key', 'tax_rate').maybeSingle()
  const taxRate = Number.parseFloat(settings?.value ?? '0.08875')
  const { data, error } = await c.db.from('planner_carts').insert({
    lead_id: leadId, planner_user_id: a.planner_user_id, tax_rate: Number.isFinite(taxRate) ? taxRate : 0.08875,
  }).select('id').single()
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not open cart' }
  touch()
  return { ok: true, id: data.id }
}

export type SaveLine = {
  itemType: CartItemType
  refId: string
  quantity: number
  discountBps: number
  note?: string
  clientUnitCents?: number | null
  markupBps?: number | null
  /** Venue lines only: venues have no catalog price. */
  venueFeeCents?: number
}

/**
 * Save lines and fees. List prices come from the database (same as the site checkout);
 * the member discount is applied here only if the planner's membership is active right now;
 * eligibility comes from the admin rules; discounts can't stack on member-discounted lines.
 */
export async function savePlannerCart(cartId: string, input: { title: string; noteToClient: string; deliveryFeeCents: number; defaultMarkupBps: number | null; lines: SaveLine[] }): Promise<Result<{ totalCents: number }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const { data: cart } = await c.db.from('planner_carts').select('id, status, planner_user_id, tax_rate').eq('id', cartId).maybeSingle()
  if (!cart) return { ok: false, error: 'Cart not found' }
  if (cart.planner_user_id !== c.user.id && !c.isAdmin) return { ok: false, error: 'Not your cart' }
  if (!['draft', 'shared'].includes(cart.status)) return { ok: false, error: 'This cart is approved and locked' }
  if (input.lines.length > 300) return { ok: false, error: 'Too many lines' }
  // CT surcharge law: no card/processing/convenience fees or non-cash adjustments as lines or notes.
  if ([input.title, input.noteToClient, ...input.lines.map((l) => l.note)].some(isBlockedFeeLabel)) {
    return { ok: false, error: 'Card, processing, transaction, or convenience fees can’t be added. Prices must be the same however the client pays.' }
  }

  const ids = (t: CartItemType) => [...new Set(input.lines.filter((l) => l.itemType === t && UUID.test(l.refId)).map((l) => l.refId))]
  const [products, packages, venues, limits, elig, member, cats] = await Promise.all([
    ids('product').length ? c.db.from('products').select('*').in('id', ids('product')) : { data: [] },
    ids('package').length ? c.db.from('packages').select('id, name, price, image_url').in('id', ids('package')) : { data: [] },
    ids('venue').length ? c.db.from('venues').select('id, name, image_url').in('id', ids('venue')) : { data: [] },
    loadCartLimits(),
    loadEligibility(),
    memberActiveFor(cart.planner_user_id),
    productCategories(ids('product')),
  ])
  const byId = new Map<string, Row>()
  for (const p of (products.data ?? []) as Row[]) byId.set(p.id, { name: p.name, price: resolvePriceCents(p), setup: Number(p.setup_fee) || 0, image: p.image_url ?? null, eligible: isEligible({ productId: p.id, categoryId: cats.get(p.id) ?? p.category_id }, elig) })
  for (const p of (packages.data ?? []) as Row[]) byId.set(p.id, { name: p.name, price: resolvePriceCents({ price: p.price }), setup: 0, image: p.image_url ?? null, eligible: false })
  for (const v of (venues.data ?? []) as Row[]) byId.set(v.id, { name: v.name, price: 0, setup: 0, image: v.image_url ?? null, eligible: false })

  const kept = input.lines.filter((l) => byId.has(l.refId))
  const ctx = { memberActive: member.active, memberDiscountBps: limits.memberDiscountBps, maxLineDiscountBps: limits.maxLineDiscountBps, defaultMarkupBps: input.defaultMarkupBps }
  const pricingLines = kept.map((l) => {
    const ref = byId.get(l.refId)!
    return {
      listUnitCents: l.itemType === 'venue' ? Math.max(0, Math.round(l.venueFeeCents ?? 0)) : ref.price,
      setupFeeCents: ref.setup, quantity: l.quantity, eligible: ref.eligible,
      clientUnitCents: l.markupBps != null ? null : l.clientUnitCents ?? null, markupBps: l.markupBps ?? null, discountBps: l.discountBps,
    }
  })
  const priced = priceCart(pricingLines, ctx, { deliveryFeeCents: input.deliveryFeeCents, taxRate: Number(cart.tax_rate) })
  const rows = kept.map((l, position) => {
    const ref = byId.get(l.refId)!
    const p = priced.lines[position]
    return {
      cart_id: cartId, item_type: l.itemType,
      product_id: l.itemType === 'product' ? l.refId : null,
      package_id: l.itemType === 'package' ? l.refId : null,
      venue_id: l.itemType === 'venue' ? l.refId : null,
      name: ref.name, image_url: ref.image,
      list_unit_cents: p.listUnitCents, cost_unit_cents: p.costUnitCents, client_unit_cents: p.clientUnitCents,
      markup_bps: l.markupBps ?? null, member_discounted: p.memberDiscounted,
      setup_fee_cents: ref.setup, quantity: p.quantity, discount_bps: p.discountBps,
      note: (l.note ?? '').slice(0, 500) || null, position,
    }
  })

  const del = await c.db.from('planner_cart_lines').delete().eq('cart_id', cartId)
  if (del.error) return { ok: false, error: del.error.message }
  if (rows.length) {
    const ins = await c.db.from('planner_cart_lines').insert(rows)
    if (ins.error) return { ok: false, error: ins.error.message }
  }
  const { error } = await c.db.from('planner_carts').update({
    title: input.title.trim().slice(0, 120) || 'Event quote',
    note_to_client: input.noteToClient.slice(0, 2000) || null,
    default_markup_bps: input.defaultMarkupBps,
    delivery_fee_cents: priced.deliveryFeeCents,
    member_active_at_pricing: member.active,
    subtotal_cents: priced.subtotalCents,
    setup_fee_cents: priced.setupFeeCents,
    tax_cents: priced.taxCents,
    total_cents: priced.totalCents,
    cost_cents: priced.costCents,
    margin_cents: priced.marginCents,
    updated_at: new Date().toISOString(),
  }).eq('id', cartId)
  if (error) return { ok: false, error: error.message }
  touch(cartId)
  return { ok: true, totalCents: priced.totalCents }
}

/** Delivery fee from the site's own distance rate (same as checkout). */
export async function quoteDeliveryFee(address: string): Promise<Result<{ cents: number }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  if (address.trim().length < 6) return { ok: false, error: 'Enter the venue address' }
  return { ok: true, cents: await calculateDeliveryFee(address.trim()) }
}

export async function sharePlannerCart(cartId: string): Promise<Result> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const { data: cart } = await c.db.from('planner_carts').select('status, total_cents').eq('id', cartId).maybeSingle()
  if (!cart) return { ok: false, error: 'Cart not found' }
  if (cart.status !== 'draft' && cart.status !== 'shared') return { ok: false, error: 'Already approved' }
  if (Number(cart.total_cents) <= 0) return { ok: false, error: 'Add items before sharing' }
  const { error } = await c.db.from('planner_carts').update({ status: 'shared', shared_at: new Date().toISOString() }).eq('id', cartId)
  if (error) return { ok: false, error: error.message }
  touch(cartId)
  return { ok: true }
}

export async function approvePlannerCart(cartId: string): Promise<Result> {
  const db = await createClient()
  const { error } = await db.rpc('client_approve_planner_cart', { p_cart: cartId })
  if (error) return { ok: false, error: error.message.includes('not allowed') ? 'You can’t approve this quote' : error.message }
  touch(cartId)
  return { ok: true }
}

/** Client payments for what's still owed on an approved cart (provider in ./payment-provider). */
export async function createCartPayments(cartId: string, plan: { mode: PlanMode; depositPct?: number; installments?: number }): Promise<Result<{ count: number }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  if (!clientPaymentsEnabled()) return { ok: false, error: 'Payments are not configured' }
  const { data: cart } = await c.db.from('planner_carts').select('*').eq('id', cartId).maybeSingle()
  if (!cart) return { ok: false, error: 'Cart not found' }
  if (cart.planner_user_id !== c.user.id && !c.isAdmin) return { ok: false, error: 'Not your cart' }
  if (cart.status !== 'approved') return { ok: false, error: 'The client needs to approve the quote first' }

  const svc = createServiceRoleClient()
  const connect = await getConnectStatus(svc, cart.planner_user_id)
  if (!canTakePayments(connect)) return { ok: false, error: 'Finish Connect payouts setup before sending payment links' }

  const limits = await loadCartLimits()
  const result = planPayments({
    totalCents: Number(cart.total_cents), paidCents: Number(cart.paid_cents), mode: plan.mode,
    depositBps: plan.depositPct != null ? Math.round(plan.depositPct * 100) : limits.defaultDepositBps, installments: plan.installments,
  })
  if (!result.payments.length) return { ok: false, error: result.warnings[0] ?? 'Nothing to collect' }

  // Deactivate earlier open links before issuing a new plan.
  const { data: old } = await svc.from('planner_cart_payments').select('id, stripe_payment_link_id, stripe_account_id').eq('cart_id', cartId).eq('status', 'open')
  for (const o of (old ?? []) as Row[]) {
    if (o.stripe_payment_link_id) await cancelClientPayment(o.stripe_payment_link_id, o.stripe_account_id).catch(() => {})
    await svc.from('planner_cart_payments').update({ status: 'void' }).eq('id', o.id)
  }
  // Prime Lux's share (application fee), spread over the payments; fees already collected count.
  const cartFee = primeLuxFeeCents({
    rentalCostCents: Number(cart.cost_cents), setupFeeCents: Number(cart.setup_fee_cents),
    deliveryFeeCents: Number(cart.delivery_fee_cents), taxRate: Number(cart.tax_rate), totalCents: Number(cart.total_cents),
    marketplaceFacilitator: limits.marketplaceFacilitator,
  })
  const { data: paidRows } = await svc.from('planner_cart_payments').select('amount_cents, application_fee_cents, platform_fee_cents').eq('cart_id', cartId).eq('status', 'paid')
  // Rental share already collected (application fee minus platform fee).
  const paidFee = ((paidRows ?? []) as Row[]).reduce((a, r) => a + Number(r.application_fee_cents) - Number(r.platform_fee_cents ?? 0), 0)
  const paidAmt = ((paidRows ?? []) as Row[]).reduce((a, r) => a + Number(r.amount_cents), 0)
  const shares = allocateFees(result.payments.map((p) => p.amountCents), cartFee, Number(cart.total_cents), paidFee, paidAmt)
  // + Prime Lux platform fee per payment (deducted from the planner's proceeds; client total unchanged).
  const fees = result.payments.map((p, i) => applicationFeeForPayment(p.amountCents, shares[i], limits.platformFee))

  let made = 0
  for (const [i, p] of result.payments.entries()) {
    const { data: row } = await svc.from('planner_cart_payments').insert({
      cart_id: cartId, kind: p.kind, label: p.label, amount_cents: p.amountCents, created_by: c.user.id,
      application_fee_cents: fees[i].applicationFeeCents, platform_fee_cents: fees[i].platformFeeCents, stripe_account_id: connect.accountId,
    }).select('id').single()
    if (!row) continue
    try {
      const handle = await createClientPayment({ paymentId: row.id, cartId, connectedAccountId: connect.accountId!, amountCents: p.amountCents, applicationFeeCents: fees[i].applicationFeeCents, label: p.label })
      await svc.from('planner_cart_payments').update({ stripe_payment_link_id: handle.providerRef, url: handle.url }).eq('id', row.id)
      made++
    } catch (e) {
      await svc.from('planner_cart_payments').update({ status: 'void' }).eq('id', row.id)
      touch(cartId)
      return { ok: false, error: `Created ${made} of ${result.payments.length}: ${(e as Error).message}` }
    }
  }
  touch(cartId)
  return { ok: true, count: made }
}

/**
 * Refund (part of) a paid cart payment on the planner's connected account. Prime Lux's
 * application fee is refunded proportionally (refund_application_fee). Totals update when
 * the Connect webhook delivers charge.refunded.
 */
export async function refundCartPayment(paymentId: string, amountCents: number): Promise<Result> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const svc = createServiceRoleClient()
  const { data: p } = await svc.from('planner_cart_payments').select('*, planner_carts(planner_user_id)').eq('id', paymentId).maybeSingle()
  if (!p) return { ok: false, error: 'Payment not found' }
  if (p.planner_carts?.planner_user_id !== c.user.id && !c.isAdmin) return { ok: false, error: 'Not your cart' }
  if (p.status !== 'paid' || !p.stripe_payment_intent_id || !p.stripe_account_id) return { ok: false, error: 'Only paid payments can be refunded' }
  const left = Number(p.amount_cents) - Number(p.refunded_cents)
  const amt = Math.round(amountCents)
  if (!(amt > 0) || amt > left) return { ok: false, error: `Refund between $0.01 and ${(left / 100).toFixed(2)}` }
  try {
    await refundClientPayment({ paymentIntentId: p.stripe_payment_intent_id, connectedAccountId: p.stripe_account_id, amountCents: amt, paymentId, nonce: `${Number(p.refunded_cents)}-${amt}` })
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
  touch(p.cart_id)
  return { ok: true }
}

/** Admin: cart limits, Prime Lux platform/service fee, and marketplace-facilitator tax flag (audited by trigger). */
export async function updateCartLimits(input: {
  maxDiscountPct: number; defaultDepositPct: number
  platformFeePct?: number; platformFeeFlat?: number; platformFeeMin?: number | null; platformFeeCap?: number | null
  marketplaceFacilitator?: boolean
}): Promise<Result> {
  const c = await caller()
  if (!c?.isAdmin) return { ok: false, error: 'Admins only' }
  const dollars = (v: number | null | undefined) => (v == null || !Number.isFinite(v) || v < 0 ? null : Math.round(v * 100))
  const pct = Math.min(50, Math.max(0, Number(input.platformFeePct ?? 0) || 0))
  const min = dollars(input.platformFeeMin), cap = dollars(input.platformFeeCap)
  if (min != null && cap != null && min > cap) return { ok: false, error: 'Minimum can’t be above the cap' }
  const { error } = await c.db.from('planner_cart_settings').update({
    max_line_discount_bps: Math.round(Math.min(100, Math.max(0, input.maxDiscountPct)) * 100),
    default_deposit_bps: Math.round(Math.min(100, Math.max(1, input.defaultDepositPct)) * 100),
    platform_fee_bps: Math.round(pct * 100),
    platform_fee_flat_cents: Math.min(100000, dollars(input.platformFeeFlat) ?? 0),
    platform_fee_min_cents: min, platform_fee_cap_cents: cap,
    marketplace_facilitator_tax: Boolean(input.marketplaceFacilitator),
    updated_by: c.user.id, updated_at: new Date().toISOString(),
  }).eq('id', 1)
  if (error) return { ok: false, error: error.message }
  touch()
  revalidatePath('/planners/membership')
  return { ok: true }
}
