import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { loadPublicCatalog } from '@/lib/catalog/public-catalog'
import { isEligible } from '@/lib/membership/policy'
import { getMembership, isBanned } from '@/lib/membership/server'
import { clientPaymentsEnabled } from './payment-provider'
import { canTakePayments, getConnectStatus } from '@/lib/connect/server'
import type { CartLimits, CartSummary, CartView, CatalogPick, PlannerCartContext, QuoteView } from './types'

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

export const DEFAULT_LIMITS: CartLimits = { memberDiscountBps: 5000, maxLineDiscountBps: 1500, defaultDepositBps: 3000 }

const leadTitle = (l: Row | null | undefined) =>
  [l?.contact_name, l?.event_type && l.event_type !== 'Event' ? l.event_type : null, l?.venue_name].filter(Boolean).join(' · ') || 'Event'

async function displayNames(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map()
  const db = await createClient()
  const { data } = await db.from('user_profiles').select('id, full_name, email').in('id', ids)
  return new Map(((data ?? []) as Row[]).map((p) => [p.id, p.full_name || p.email || 'Planner']))
}

export async function loadCartLimits(): Promise<CartLimits> {
  const db = await createClient()
  const { data } = await db.from('planner_cart_settings').select('*').eq('id', 1).maybeSingle()
  return data
    ? { memberDiscountBps: data.member_discount_bps, maxLineDiscountBps: data.max_line_discount_bps, defaultDepositBps: data.default_deposit_bps }
    : DEFAULT_LIMITS
}

/** Eligibility maps (product and category rules). */
export async function loadEligibility() {
  const db = await createClient()
  const { data } = await db.from('member_discount_eligibility').select('target_type, target_id, eligible')
  const product = new Map<string, boolean>()
  const category = new Map<string, boolean>()
  for (const r of (data ?? []) as Row[]) (r.target_type === 'product' ? product : category).set(r.target_id, r.eligible)
  return { product, category }
}

/** Server-side truth: is this planner an active, unbanned member right now? */
export async function memberActiveFor(plannerId: string) {
  const svc = createServiceRoleClient()
  const m = await getMembership(svc, plannerId)
  const banned = await isBanned(svc, plannerId, null).catch(() => true)
  return { status: m?.status ?? 'none', active: m?.status === 'active' && !banned }
}

/** Planner/admin list (RLS: planners own, admins all). */
export async function loadCartList(): Promise<CartSummary[]> {
  const db = await createClient()
  const { data } = await db
    .from('planner_carts')
    .select('*, venue_leads(contact_name, venue_name, event_date, event_type)')
    .neq('status', 'void')
    .order('updated_at', { ascending: false })
    .limit(200)
  const rows = (data ?? []) as Row[]
  const names = await displayNames([...new Set(rows.map((r) => r.planner_user_id))])
  return rows.map((r) => ({
    id: r.id, leadId: r.lead_id, eventTitle: leadTitle(r.venue_leads), eventDate: r.venue_leads?.event_date ?? null,
    clientName: r.venue_leads?.contact_name ?? 'Client', plannerName: names.get(r.planner_user_id) ?? 'Planner',
    title: r.title, status: r.status, paidCents: Number(r.paid_cents), orderId: r.order_id, updatedAt: r.updated_at,
    totalCents: Number(r.total_cents), marginCents: Number(r.margin_cents),
  }))
}

export async function loadCart(cartId: string): Promise<CartView | null> {
  const db = await createClient()
  const [{ data: cart }, { data: lines }, { data: payments }] = await Promise.all([
    db.from('planner_carts').select('*, venue_leads(contact_name, venue_name, event_date, event_type)').eq('id', cartId).maybeSingle(),
    db.from('planner_cart_lines').select('*').eq('cart_id', cartId).order('position'),
    db.from('planner_cart_payments').select('id, kind, label, amount_cents, url, status, application_fee_cents, stripe_fee_cents, refunded_cents, fee_refunded_cents, dispute_status').eq('cart_id', cartId).order('created_at'),
  ])
  if (!cart) return null
  const names = await displayNames([cart.planner_user_id])
  const elig = await loadEligibility()
  const productCats = await productCategories(((lines ?? []) as Row[]).map((l) => l.product_id).filter(Boolean))
  return {
    id: cart.id,
    leadId: cart.lead_id,
    eventTitle: leadTitle(cart.venue_leads),
    eventDate: cart.venue_leads?.event_date ?? null,
    clientName: cart.venue_leads?.contact_name ?? 'Client',
    plannerName: names.get(cart.planner_user_id) ?? 'Planner',
    title: cart.title,
    status: cart.status,
    noteToClient: cart.note_to_client ?? '',
    defaultMarkupBps: cart.default_markup_bps,
    deliveryFeeCents: Number(cart.delivery_fee_cents),
    taxRate: Number(cart.tax_rate),
    paidCents: Number(cart.paid_cents),
    orderId: cart.order_id,
    approvedAt: cart.approved_at,
    updatedAt: cart.updated_at,
    lines: ((lines ?? []) as Row[]).map((l) => ({
      id: l.id, itemType: l.item_type, refId: l.product_id ?? l.package_id ?? l.venue_id, name: l.name, imageUrl: l.image_url,
      listUnitCents: Number(l.list_unit_cents),
      eligible: l.item_type === 'product' && isEligible({ productId: l.product_id, categoryId: productCats.get(l.product_id) }, elig),
      clientUnitCents: l.markup_bps == null ? Number(l.client_unit_cents) : null,
      markupBps: l.markup_bps, setupFeeCents: Number(l.setup_fee_cents), quantity: l.quantity, discountBps: l.discount_bps, note: l.note ?? '',
    })),
    payments: ((payments ?? []) as Row[]).map((p) => ({
      id: p.id, kind: p.kind, label: p.label, amountCents: Number(p.amount_cents), url: p.url, status: p.status,
      split: {
        applicationFeeCents: Number(p.application_fee_cents), stripeFeeCents: p.stripe_fee_cents == null ? null : Number(p.stripe_fee_cents),
        refundedCents: Number(p.refunded_cents), feeRefundedCents: Number(p.fee_refunded_cents), disputeStatus: p.dispute_status,
      },
    })),
  }
}

export async function productCategories(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map()
  const db = await createClient()
  const { data } = await db.from('products').select('id, category_id').in('id', ids)
  return new Map(((data ?? []) as Row[]).map((p) => [p.id, p.category_id]))
}

/** Client quotes via security-definer RPCs: client prices only, never cost or margin. */
export async function loadClientQuotes(): Promise<{ id: string; title: string; status: string; totalCents: number }[]> {
  const db = await createClient()
  const { data } = await db.rpc('client_quotes')
  return ((data ?? []) as Row[]).map((q) => ({ id: q.id, title: q.title, status: q.status, totalCents: Number(q.total_cents) }))
}

export async function loadClientQuote(cartId: string): Promise<QuoteView | null> {
  const db = await createClient()
  const [{ data: quotes }, { data: lines }, { data: payments }] = await Promise.all([
    db.rpc('client_quotes'),
    db.rpc('client_quote_lines', { p_cart: cartId }),
    db.rpc('client_quote_payments', { p_cart: cartId }),
  ])
  const q = ((quotes ?? []) as Row[]).find((r) => r.id === cartId)
  if (!q) return null
  const { data: lead } = await db.from('venue_leads').select('event_date').eq('id', q.lead_id).maybeSingle()
  return {
    id: q.id, title: q.title, status: q.status, plannerName: 'Your planner', eventDate: lead?.event_date ?? null,
    noteToClient: q.note_to_client ?? '',
    lines: ((lines ?? []) as Row[]).map((l) => ({ id: l.id, name: l.name, clientUnitCents: Number(l.client_unit_cents), setupFeeCents: Number(l.setup_fee_cents), quantity: l.quantity, discountBps: l.discount_bps, note: l.note ?? '' })),
    subtotalCents: Number(q.subtotal_cents), setupFeeCents: Number(q.setup_fee_cents), deliveryFeeCents: Number(q.delivery_fee_cents),
    taxCents: Number(q.tax_cents), totalCents: Number(q.total_cents), paidCents: Number(q.paid_cents),
    payments: ((payments ?? []) as Row[]).map((p) => ({ id: p.id, kind: p.kind, label: p.label, amountCents: Number(p.amount_cents), url: p.url, status: p.status })),
  }
}

/**
 * Picker catalog. Products come from the same loader as the public catalog (same prices);
 * setup fees, categories, packages, and venues come from the database.
 */
export async function loadCartCatalog(): Promise<CatalogPick[]> {
  const db = await createClient()
  const [catalog, meta, packages, venues, elig] = await Promise.all([
    loadPublicCatalog({ limit: 500 }),
    db.from('products').select('id, setup_fee, category_id'),
    db.from('packages').select('id, name, price, image_url'),
    db.from('venues').select('id, name, image_url').eq('published', true),
    loadEligibility(),
  ])
  const metaById = new Map(((meta.data ?? []) as Row[]).map((p) => [p.id, p]))
  return [
    ...catalog.products.map((p) => {
      const m = metaById.get(p.id)
      return {
        itemType: 'product' as const, refId: p.id, name: p.name, category: p.category_name, priceCents: p.price,
        setupFeeCents: Number(m?.setup_fee) || 0, imageUrl: p.image_url,
        eligible: isEligible({ productId: p.id, categoryId: m?.category_id ?? p.category_id }, elig),
      }
    }),
    ...((packages.data ?? []) as Row[]).map((p) => ({
      itemType: 'package' as const, refId: p.id, name: p.name, category: 'Packages', priceCents: Number(p.price) || 0, setupFeeCents: 0, imageUrl: p.image_url, eligible: false,
    })),
    ...((venues.data ?? []) as Row[]).map((v) => ({
      itemType: 'venue' as const, refId: v.id, name: v.name, category: 'Venues', priceCents: 0, setupFeeCents: 0, imageUrl: v.image_url, eligible: false,
    })),
  ]
}

export async function loadPlannerContext(plannerId: string): Promise<PlannerCartContext> {
  const cs = await getConnectStatus(createServiceRoleClient(), plannerId)
  const [limits, catalog, member] = await Promise.all([loadCartLimits(), loadCartCatalog(), memberActiveFor(plannerId)])
  return { limits, catalog, memberStatus: member.status, memberActive: member.active, stripeConfigured: clientPaymentsEnabled(), connect: { ready: canTakePayments(cs), started: Boolean(cs.accountId), payoutsEnabled: cs.payoutsEnabled } }
}

/** Events assigned to the current planner (or all, for admins). */
export async function loadCartableEvents(): Promise<{ leadId: string; title: string; eventDate: string | null }[]> {
  const db = await createClient()
  const { data } = await db.from('planner_event_assignments').select('lead_id, venue_leads(contact_name, venue_name, event_date, event_type)')
  return ((data ?? []) as Row[]).map((t) => ({ leadId: t.lead_id, title: leadTitle(t.venue_leads), eventDate: t.venue_leads?.event_date ?? null }))
}

