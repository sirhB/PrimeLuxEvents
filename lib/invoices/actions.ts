'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { resolvePriceCents } from '@/lib/catalog/adapters'
import { requireStripe, stripe } from '@/lib/stripe'
import { isEligible } from '@/lib/membership/policy'
import { loadCartLimits, loadEligibility, memberActiveFor, productCategories } from '@/lib/carts/load'
import { planPayments, priceLine, type PlanMode } from '@/lib/carts/pricing'
import { allocateFees } from '@/lib/carts/split'
import { canTakePayments, getConnectStatus } from '@/lib/connect/server'
import { invoiceAllowed, priceInvoice, type InvoiceAction } from './math'
import { rollUpInvoice } from './sync'

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string }
type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const POWERED_BY = 'Powered by Prime Lux Events'

async function caller() {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) return null
  const { data: isAdmin } = await db.rpc('is_admin')
  return { db, user, isAdmin: Boolean(isAdmin), svc: createServiceRoleClient() }
}

/** Gate on the invoice OWNER's membership (admins act on a planner's behalf, same rules). */
async function gate(plannerId: string, action: InvoiceAction): Promise<string | null> {
  const m = await memberActiveFor(plannerId)
  return invoiceAllowed(action, { status: m.status as never, banned: m.status === 'active' && !m.active }) ? null : 'Invoicing is included with an active planner membership'
}

function touch(id?: string) {
  revalidatePath('/admin/invoices')
  if (id) revalidatePath(`/admin/invoices/${id}`)
}

async function ownInvoice(c: NonNullable<Awaited<ReturnType<typeof caller>>>, id: string) {
  if (!UUID.test(id)) return null
  const { data } = await c.svc.from('planner_invoices').select('*').eq('id', id).maybeSingle()
  if (!data || (data.planner_user_id !== c.user.id && !c.isAdmin)) return null
  return data as Row
}

export async function upsertClient(input: { name: string; email: string; phone?: string; company?: string }): Promise<Result<{ id: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const g = await gate(c.user.id, 'create'); if (g) return { ok: false, error: g }
  const email = input.email.trim().toLowerCase()
  if (!input.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Add a name and a valid email' }
  const { data, error } = await c.svc.from('planner_clients').upsert({
    planner_user_id: c.user.id, name: input.name.trim().slice(0, 120), email,
    phone: input.phone?.trim().slice(0, 40) || null, company: input.company?.trim().slice(0, 120) || null, updated_at: new Date().toISOString(),
  }, { onConflict: 'planner_user_id,email' }).select('id').single()
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not save client' }
  touch()
  return { ok: true, id: data.id }
}

export async function createInvoice(clientId: string): Promise<Result<{ id: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const g = await gate(c.user.id, 'create'); if (g) return { ok: false, error: g }
  const { data: client } = await c.svc.from('planner_clients').select('id, planner_user_id').eq('id', clientId).maybeSingle()
  if (!client || client.planner_user_id !== c.user.id) return { ok: false, error: 'Pick one of your clients' }
  const { data: tax } = await c.svc.from('settings').select('value').eq('key', 'tax_rate').maybeSingle()
  const rate = Number.parseFloat(tax?.value ?? '0.08875')
  const due = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10)
  const { data, error } = await c.svc.from('planner_invoices').insert({
    planner_user_id: c.user.id, client_id: clientId, due_date: due, tax_rate: Number.isFinite(rate) ? rate : 0.08875,
  }).select('id').single()
  if (error || !data) return { ok: false, error: error?.message ?? 'Could not create invoice' }
  touch()
  return { ok: true, id: data.id }
}

export type SaveInvoiceLine =
  | { kind: 'catalog'; productId: string | null; keepLineId?: string; quantity: number; markupBps: number | null; description?: string }
  | { kind: 'custom'; name: string; description?: string; quantity: number; unitCents: number; taxable: boolean }

export type SaveInvoiceInput = {
  title: string; memo: string; dueDate: string | null; deliveryFeeCents: number
  planMode: PlanMode; depositPct?: number; installments?: number; lines: SaveInvoiceLine[]
}

/**
 * Save a draft. Catalog prices come from the database and the member discount applies only
 * if the planner's membership is active now (same rules as carts). Custom lines are the
 * planner's own services at the planner's price. The Prime Lux fee is recomputed here.
 */
export async function saveInvoice(id: string, input: SaveInvoiceInput): Promise<Result<{ totalCents: number; feeCents: number }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const inv = await ownInvoice(c, id)
  if (!inv) return { ok: false, error: 'Invoice not found' }
  if (inv.status !== 'draft') return { ok: false, error: 'Sent invoices are locked. Void it and start a new one.' }
  const g = await gate(inv.planner_user_id, 'edit'); if (g) return { ok: false, error: g }
  if (input.lines.length > 200) return { ok: false, error: 'Too many lines' }
  if (input.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) return { ok: false, error: 'Bad due date' }

  const productIds = [...new Set(input.lines.flatMap((l) => (l.kind === 'catalog' && l.productId && UUID.test(l.productId) ? [l.productId] : [])))]
  const [products, limits, elig, member, cats, { data: oldLines }] = await Promise.all([
    productIds.length ? c.svc.from('products').select('*').in('id', productIds) : Promise.resolve({ data: [] as Row[] }),
    loadCartLimits(), loadEligibility(), memberActiveFor(inv.planner_user_id), productCategories(productIds),
    c.svc.from('planner_invoice_lines').select('*').eq('invoice_id', id),
  ])
  const byId = new Map<string, Row>(((products.data ?? []) as Row[]).map((p) => [p.id, p]))
  const kept = new Map<string, Row>(((oldLines ?? []) as Row[]).filter((l) => l.kind === 'catalog' && !l.product_id).map((l) => [l.id, l]))
  const ctx = { memberActive: member.active, memberDiscountBps: limits.memberDiscountBps, maxLineDiscountBps: limits.maxLineDiscountBps, defaultMarkupBps: null }

  type Cat = { name: string; productId: string | null; list: number; setup: number; eligible: boolean; quantity: number; markupBps: number | null; description: string }
  const catalog: Cat[] = []
  const custom: Extract<SaveInvoiceLine, { kind: 'custom' }>[] = []
  const order: ('catalog' | 'custom')[] = []
  for (const l of input.lines) {
    const q = Math.max(1, Math.min(100000, Math.floor(l.quantity || 1)))
    if (l.kind === 'custom') {
      if (!l.name.trim()) continue
      custom.push({ ...l, name: l.name.trim().slice(0, 200), quantity: q, unitCents: Math.max(0, Math.round(l.unitCents || 0)) }); order.push('custom')
    } else if (l.productId && byId.has(l.productId)) {
      const p = byId.get(l.productId)!
      catalog.push({ name: p.name, productId: p.id, list: resolvePriceCents(p), setup: Number(p.setup_fee) || 0, eligible: isEligible({ productId: p.id, categoryId: cats.get(p.id) ?? p.category_id }, elig), quantity: q, markupBps: l.markupBps, description: l.description ?? '' }); order.push('catalog')
    } else if (l.keepLineId && kept.has(l.keepLineId)) {
      // Package/venue lines carried over from a cart: keep the server-stored list price.
      const k = kept.get(l.keepLineId)!
      catalog.push({ name: k.name, productId: null, list: Number(k.list_unit_cents), setup: Number(k.setup_fee_cents), eligible: false, quantity: q, markupBps: l.markupBps, description: l.description ?? '' }); order.push('catalog')
    }
  }
  const pricingLines = catalog.map((l) => ({ listUnitCents: l.list, setupFeeCents: l.setup, quantity: l.quantity, eligible: l.eligible, markupBps: l.markupBps }))
  const priced = priceInvoice(pricingLines, custom, ctx, { deliveryFeeCents: input.deliveryFeeCents, taxRate: Number(inv.tax_rate) })

  let ci = 0, ui = 0
  const rows = order.map((k, position) => {
    if (k === 'catalog') {
      const l = catalog[ci]; const p = priceLine(pricingLines[ci], ctx); ci++
      return { invoice_id: id, position, kind: 'catalog', product_id: l.productId, name: l.name, description: l.description.slice(0, 500) || null, quantity: l.quantity, list_unit_cents: l.list, setup_fee_cents: l.setup, eligible: l.eligible, markup_bps: l.markupBps, unit_cents: p.clientUnitCents, taxable: true }
    }
    const l = custom[ui++]
    return { invoice_id: id, position, kind: 'custom', product_id: null, name: l.name, description: (l.description ?? '').slice(0, 500) || null, quantity: l.quantity, list_unit_cents: 0, setup_fee_cents: 0, eligible: false, markup_bps: null, unit_cents: l.unitCents, taxable: l.taxable }
  })
  await c.svc.from('planner_invoice_lines').delete().eq('invoice_id', id)
  if (rows.length) {
    const ins = await c.svc.from('planner_invoice_lines').insert(rows)
    if (ins.error) return { ok: false, error: ins.error.message }
  }
  const { error } = await c.svc.from('planner_invoices').update({
    title: input.title.trim().slice(0, 120) || 'Invoice', memo: input.memo.slice(0, 2000) || null, due_date: input.dueDate,
    delivery_fee_cents: priced.deliveryFeeCents, plan_mode: input.planMode,
    deposit_bps: input.planMode === 'deposit' ? Math.round(Math.min(99, Math.max(1, input.depositPct ?? 30)) * 100) : null,
    installments: input.planMode === 'installments' ? Math.min(12, Math.max(2, Math.floor(input.installments ?? 3))) : null,
    member_active_at_pricing: member.active, total_cents: priced.totalCents, tax_cents: priced.taxCents,
    prime_lux_fee_cents: priced.primeLuxFeeCents, updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  touch(id)
  return { ok: true, totalCents: priced.totalCents, feeCents: priced.primeLuxFeeCents }
}

const addDays = (iso: string, d: number) => new Date(Date.parse(`${iso}T12:00:00Z`) + d * 864e5).toISOString().slice(0, 10)
const unix = (iso: string) => Math.floor(Date.parse(`${iso}T23:59:59Z`) / 1000)

/**
 * Send: the planner presses Send; nothing auto-sends. Creates one Stripe invoice per scheduled
 * payment ON the planner's connected account (direct), each with its share of the Prime Lux
 * application fee, finalizes it, and has Stripe email it. First payment is due on the due
 * date; later installments every 30 days after. Reminders follow Stripe's invoice settings.
 */
export async function sendInvoice(id: string): Promise<Result<{ count: number }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  if (!stripe) return { ok: false, error: 'Payments are not configured' }
  const inv = await ownInvoice(c, id)
  if (!inv) return { ok: false, error: 'Invoice not found' }
  if (inv.status !== 'draft') return { ok: false, error: 'Already sent' }
  const g = await gate(inv.planner_user_id, 'send'); if (g) return { ok: false, error: g }
  const connect = await getConnectStatus(c.svc, inv.planner_user_id)
  if (!canTakePayments(connect)) return { ok: false, error: 'Finish Connect payouts setup before sending invoices' }
  if (Number(inv.total_cents) <= 0) return { ok: false, error: 'Add at least one line' }
  const acct = connect.accountId!
  const s = requireStripe()
  const opt = (key: string) => ({ stripeAccount: acct, idempotencyKey: `${key}` })

  const [{ data: client }, { data: lines }, { data: existing }] = await Promise.all([
    c.svc.from('planner_clients').select('*').eq('id', inv.client_id).single(),
    c.svc.from('planner_invoice_lines').select('*').eq('invoice_id', id).order('position'),
    c.svc.from('planner_invoice_payments').select('id').eq('invoice_id', id),
  ])
  if (existing?.length) return { ok: false, error: 'A send is already in progress' }

  // Customer lives on the planner's account.
  let customer = client.stripe_account_id === acct ? client.stripe_customer_id : null
  if (!customer) {
    const cu = await s.customers.create({ name: client.name, email: client.email, phone: client.phone ?? undefined, metadata: { planner_client_id: client.id } }, opt(`pc-${client.id}-${acct}`))
    customer = cu.id
    await c.svc.from('planner_clients').update({ stripe_customer_id: cu.id, stripe_account_id: acct }).eq('id', client.id)
  }

  const plan = planPayments({ totalCents: Number(inv.total_cents), mode: inv.plan_mode, depositBps: inv.deposit_bps ?? 3000, installments: inv.installments ?? 3 })
  if (!plan.payments.length) return { ok: false, error: plan.warnings[0] ?? 'Nothing to collect' }
  const fees = allocateFees(plan.payments.map((p) => p.amountCents), Number(inv.prime_lux_fee_cents), Number(inv.total_cents))
  const first = inv.due_date ?? addDays(new Date().toISOString().slice(0, 10), 14)

  // Itemize on Stripe when there's a single payment; otherwise one line per scheduled payment.
  const ls = (lines ?? []) as Row[]
  const items: { amount: number; description: string }[] = ls.map((l) => ({ amount: Number(l.unit_cents) * l.quantity, description: `${l.name}${l.quantity > 1 ? ` × ${l.quantity}` : ''}` }))
  const setup = ls.filter((l) => l.kind === 'catalog').reduce((a, l) => a + Number(l.setup_fee_cents) * l.quantity, 0)
  if (setup) items.push({ amount: setup, description: 'Setup' })
  if (Number(inv.delivery_fee_cents)) items.push({ amount: Number(inv.delivery_fee_cents), description: 'Delivery' })
  if (Number(inv.tax_cents)) items.push({ amount: Number(inv.tax_cents), description: 'Sales tax' })
  const itemized = plan.payments.length === 1 && items.reduce((a, i) => a + i.amount, 0) === Number(inv.total_cents)

  let made = 0
  for (const [i, p] of plan.payments.entries()) {
    const due = i === 0 ? first : addDays(first, 30 * i)
    const { data: row } = await c.svc.from('planner_invoice_payments').insert({
      invoice_id: id, position: i, label: p.label, amount_cents: p.amountCents, application_fee_cents: fees[i], due_date: due,
    }).select('id').single()
    if (!row) return { ok: false, error: 'Could not record payment' }
    try {
      const meta = { kind: 'planner_invoice', planner_invoice_id: id, planner_invoice_payment_id: row.id }
      const draft = await s.invoices.create({
        customer, collection_method: 'send_invoice', due_date: unix(due), auto_advance: false, currency: 'usd',
        application_fee_amount: fees[i] || undefined,
        description: [inv.title, plan.payments.length > 1 ? `${p.label} (${i + 1} of ${plan.payments.length})` : null].filter(Boolean).join(' · '),
        footer: [inv.memo, POWERED_BY].filter(Boolean).join('\n\n'),
        metadata: meta,
      }, opt(`inv-${row.id}`))
      const list = itemized ? items : [{ amount: p.amountCents, description: `${p.label} for ${inv.title}` }]
      for (const [j, it] of list.entries()) {
        await s.invoiceItems.create({ customer, invoice: draft.id, amount: it.amount, currency: 'usd', description: it.description }, opt(`ii-${row.id}-${j}`))
      }
      const fin = await s.invoices.finalizeInvoice(draft.id, { auto_advance: true }, opt(`fin-${row.id}`))
      const sent = await s.invoices.sendInvoice(fin.id, {}, opt(`send-${row.id}`))
      await c.svc.from('planner_invoice_payments').update({
        stripe_invoice_id: sent.id, number: sent.number, hosted_invoice_url: sent.hosted_invoice_url, invoice_pdf: sent.invoice_pdf, status: sent.status ?? 'open',
      }).eq('id', row.id)
      made++
    } catch (e) {
      await c.svc.from('planner_invoice_payments').update({ status: 'void' }).eq('id', row.id)
      await rollUpInvoice(c.svc, id)
      touch(id)
      return { ok: false, error: `Sent ${made} of ${plan.payments.length}: ${(e as Error).message}` }
    }
  }
  await c.svc.from('planner_invoices').update({ status: 'open', sent_at: new Date().toISOString(), stripe_account_id: acct }).eq('id', id)
  touch(id)
  return { ok: true, count: made }
}

/** Void every unpaid scheduled payment (paid ones stay paid; refund those separately in Stripe). */
export async function voidInvoice(id: string): Promise<Result> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  const inv = await ownInvoice(c, id)
  if (!inv) return { ok: false, error: 'Invoice not found' }
  if (inv.status === 'draft') {
    await c.svc.from('planner_invoices').update({ status: 'void' }).eq('id', id)
    touch(id); return { ok: true }
  }
  const { data: pays } = await c.svc.from('planner_invoice_payments').select('id, stripe_invoice_id, status').eq('invoice_id', id)
  for (const p of (pays ?? []) as Row[]) {
    if (p.status !== 'open' && p.status !== 'uncollectible') continue
    try {
      if (p.stripe_invoice_id) await requireStripe().invoices.voidInvoice(p.stripe_invoice_id, {}, { stripeAccount: inv.stripe_account_id })
      await c.svc.from('planner_invoice_payments').update({ status: 'void' }).eq('id', p.id)
    } catch (e) { return { ok: false, error: (e as Error).message } }
  }
  await rollUpInvoice(c.svc, id)
  touch(id)
  return { ok: true }
}

/** Convert a cart / client quote into a draft invoice (client from the event's contact). */
export async function convertCartToInvoice(cartId: string): Promise<Result<{ id: string }>> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  if (!UUID.test(cartId)) return { ok: false, error: 'Cart not found' }
  const { data: cart } = await c.svc.from('planner_carts').select('*, venue_leads(contact_name, contact_email, contact_phone)').eq('id', cartId).maybeSingle()
  if (!cart || (cart.planner_user_id !== c.user.id && !c.isAdmin)) return { ok: false, error: 'Cart not found' }
  const g = await gate(cart.planner_user_id, 'create'); if (g) return { ok: false, error: g }
  const lead = (cart.venue_leads ?? {}) as Row
  if (!lead.contact_email) return { ok: false, error: 'The event has no client email. Add the client first.' }
  const { data: client, error: ce } = await c.svc.from('planner_clients').upsert({
    planner_user_id: cart.planner_user_id, name: lead.contact_name || 'Client', email: String(lead.contact_email).toLowerCase(),
    phone: lead.contact_phone ?? null, lead_id: cart.lead_id, updated_at: new Date().toISOString(),
  }, { onConflict: 'planner_user_id,email' }).select('id').single()
  if (ce || !client) return { ok: false, error: ce?.message ?? 'Could not save client' }
  const { data: inv, error } = await c.svc.from('planner_invoices').insert({
    planner_user_id: cart.planner_user_id, client_id: client.id, cart_id: cartId, title: cart.title, memo: cart.note_to_client,
    delivery_fee_cents: cart.delivery_fee_cents, tax_rate: cart.tax_rate,
    due_date: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
  }).select('id').single()
  if (error || !inv) return { ok: false, error: error?.message ?? 'Could not create invoice' }
  const { data: lines } = await c.svc.from('planner_cart_lines').select('*').eq('cart_id', cartId).order('position')
  const rows = ((lines ?? []) as Row[]).map((l, position) => ({
    invoice_id: inv.id, position, kind: 'catalog', product_id: l.product_id, name: l.name, description: l.note,
    quantity: l.quantity, list_unit_cents: l.list_unit_cents, setup_fee_cents: l.setup_fee_cents,
    eligible: Boolean(l.member_discounted), unit_cents: l.client_unit_cents,
    // Keep the planner's client price as a markup on cost.
    markup_bps: Number(l.cost_unit_cents) > 0 ? Math.max(0, Math.round((Number(l.client_unit_cents) / Number(l.cost_unit_cents) - 1) * 10000)) : 0,
    taxable: true,
  }))
  if (rows.length) await c.svc.from('planner_invoice_lines').insert(rows)
  // Reprice server-side so the snapshot and fee are authoritative.
  const back = rows.map((r) => (r.product_id
    ? { kind: 'catalog' as const, productId: r.product_id, quantity: r.quantity, markupBps: r.markup_bps, description: r.description ?? '' }
    : { kind: 'catalog' as const, productId: null, keepLineId: '', quantity: r.quantity, markupBps: r.markup_bps, description: r.description ?? '' }))
  const { data: saved } = await c.svc.from('planner_invoice_lines').select('id, product_id, position').eq('invoice_id', inv.id).order('position')
  ;((saved ?? []) as Row[]).forEach((s2, i) => { if (!s2.product_id && back[i]) (back[i] as { keepLineId?: string }).keepLineId = s2.id })
  const r = await saveInvoice(inv.id, { title: cart.title, memo: cart.note_to_client ?? '', dueDate: null, deliveryFeeCents: Number(cart.delivery_fee_cents), planMode: 'full', lines: back })
  if (!r.ok) return r
  touch()
  return { ok: true, id: inv.id }
}

/** Branding on the planner's Stripe account: business name + logo show on Stripe invoices and emails. */
export async function saveBranding(form: FormData): Promise<Result> {
  const c = await caller()
  if (!c) return { ok: false, error: 'Sign in first' }
  if (!stripe) return { ok: false, error: 'Payments are not configured' }
  const g = await gate(c.user.id, 'edit'); if (g) return { ok: false, error: g }
  const { accountId } = await getConnectStatus(c.svc, c.user.id)
  if (!accountId) return { ok: false, error: 'Connect payouts first' }
  const name = String(form.get('businessName') ?? '').trim().slice(0, 100)
  const logo = form.get('logo')
  const s = requireStripe()
  let fileId: string | undefined
  if (logo instanceof File && logo.size > 0) {
    if (logo.size > 512 * 1024 || !['image/png', 'image/jpeg'].includes(logo.type)) return { ok: false, error: 'Logo must be a PNG or JPG under 512 KB' }
    const f = await s.files.create({ purpose: 'business_logo', file: { data: Buffer.from(await logo.arrayBuffer()), name: logo.name, type: logo.type } }, { stripeAccount: accountId })
    fileId = f.id
  }
  await s.accounts.update(accountId, {
    ...(name ? { business_profile: { name } } : {}),
    ...(fileId ? { settings: { branding: { logo: fileId } } } : {}),
  })
  await c.svc.from('planner_connect_accounts').update({ ...(name ? { business_name: name } : {}), ...(fileId ? { logo_file_id: fileId } : {}) }).eq('planner_user_id', c.user.id)
  touch()
  return { ok: true }
}
