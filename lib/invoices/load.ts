import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { loadCartCatalog, loadCartLimits, memberActiveFor } from '@/lib/carts/load'
import { canTakePayments, getConnectStatus } from '@/lib/connect/server'
import { siteUrl } from '@/lib/membership/stripe'
import { displayStatus } from './math'
import type { ClientView, InvoiceContext, InvoiceSummary, InvoiceView, PublicInvoice } from './types'

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const today = () => new Date().toISOString().slice(0, 10)

async function names(ids: string[]) {
  const m = new Map<string, string>()
  if (!ids.length) return m
  const { data } = await createServiceRoleClient().from('planner_connect_accounts').select('planner_user_id, business_name').in('planner_user_id', ids)
  for (const r of (data ?? []) as Row[]) if (r.business_name) m.set(r.planner_user_id, r.business_name)
  return m
}

/** RLS: planners see their own invoices; admins see all. */
export async function loadInvoiceList(): Promise<InvoiceSummary[]> {
  const db = await createClient()
  const { data } = await db.from('planner_invoices').select('id, title, status, due_date, total_cents, paid_cents, prime_lux_fee_cents, created_at, planner_user_id, planner_clients(name)').order('created_at', { ascending: false }).limit(300)
  const rows = (data ?? []) as Row[]
  const nm = await names([...new Set(rows.map((r) => r.planner_user_id))])
  return rows.map((r) => ({
    id: r.id, title: r.title, status: r.status, display: displayStatus(r.status, r.due_date, today()), dueDate: r.due_date,
    totalCents: Number(r.total_cents), paidCents: Number(r.paid_cents), primeLuxFeeCents: Number(r.prime_lux_fee_cents),
    clientName: r.planner_clients?.name ?? 'Client', plannerName: nm.get(r.planner_user_id) ?? 'Planner', createdAt: r.created_at,
  }))
}

export async function loadClientList(): Promise<ClientView[]> {
  const db = await createClient()
  const [{ data: clients }, { data: inv }] = await Promise.all([
    db.from('planner_clients').select('id, name, email, phone, company').order('name'),
    db.from('planner_invoices').select('client_id, status, total_cents, paid_cents'),
  ])
  return ((clients ?? []) as Row[]).map((c) => {
    const mine = ((inv ?? []) as Row[]).filter((i) => i.client_id === c.id)
    return {
      id: c.id, name: c.name, email: c.email, phone: c.phone, company: c.company, invoiceCount: mine.length,
      openCents: mine.filter((i) => i.status === 'open' || i.status === 'uncollectible').reduce((a, i) => a + Number(i.total_cents) - Number(i.paid_cents), 0),
    }
  })
}

export async function loadInvoice(id: string): Promise<InvoiceView | null> {
  const db = await createClient()
  const [{ data: inv }, { data: lines }, { data: pays }] = await Promise.all([
    db.from('planner_invoices').select('*, planner_clients(id, name, email)').eq('id', id).maybeSingle(),
    db.from('planner_invoice_lines').select('*').eq('invoice_id', id).order('position'),
    db.from('planner_invoice_payments').select('*').eq('invoice_id', id).order('position'),
  ])
  if (!inv) return null
  const nm = await names([inv.planner_user_id])
  return {
    id: inv.id, plannerName: nm.get(inv.planner_user_id) ?? 'Planner',
    client: { id: inv.planner_clients?.id, name: inv.planner_clients?.name ?? 'Client', email: inv.planner_clients?.email ?? '' },
    cartId: inv.cart_id, title: inv.title, memo: inv.memo ?? '', status: inv.status, display: displayStatus(inv.status, inv.due_date, today()),
    planMode: inv.plan_mode, depositBps: inv.deposit_bps, installments: inv.installments, dueDate: inv.due_date,
    deliveryFeeCents: Number(inv.delivery_fee_cents), taxRate: Number(inv.tax_rate), totalCents: Number(inv.total_cents),
    primeLuxFeeCents: Number(inv.prime_lux_fee_cents), paidCents: Number(inv.paid_cents),
    payUrl: inv.status === 'draft' || inv.status === 'void' ? null : `${siteUrl()}/pay/invoice/${inv.id}?t=${inv.access_token}`,
    lines: ((lines ?? []) as Row[]).map((l) => ({
      id: l.id, kind: l.kind, productId: l.product_id, name: l.name, description: l.description ?? '', quantity: l.quantity,
      listUnitCents: Number(l.list_unit_cents), setupFeeCents: Number(l.setup_fee_cents), eligible: l.eligible, markupBps: l.markup_bps,
      unitCents: Number(l.unit_cents), taxable: l.taxable,
    })),
    payments: ((pays ?? []) as Row[]).map((p) => ({
      id: p.id, label: p.label, amountCents: Number(p.amount_cents), applicationFeeCents: Number(p.application_fee_cents), platformFeeCents: Number(p.platform_fee_cents ?? 0),
      stripeFeeCents: p.stripe_fee_cents == null ? null : Number(p.stripe_fee_cents), dueDate: p.due_date, status: p.status,
      number: p.number, hostedUrl: p.hosted_invoice_url, pdfUrl: p.invoice_pdf,
    })),
  }
}

export async function loadInvoiceContext(plannerId: string): Promise<InvoiceContext> {
  const svc = createServiceRoleClient()
  const db = await createClient()
  const [member, limits, catalog, connect, { data: clients }] = await Promise.all([
    memberActiveFor(plannerId), loadCartLimits(), loadCartCatalog(), getConnectStatus(svc, plannerId),
    db.from('planner_clients').select('id, name, email').eq('planner_user_id', plannerId).order('name'),
  ])
  return {
    memberStatus: member.status as InvoiceContext['memberStatus'],
    memberActive: member.active,
    canInvoice: member.active, // = invoiceAllowed('create', ...): active and not banned
    connectReady: canTakePayments(connect),
    memberDiscountBps: limits.memberDiscountBps, maxLineDiscountBps: limits.maxLineDiscountBps,
    platformFee: limits.platformFee, marketplaceFacilitator: limits.marketplaceFacilitator,
    catalog: catalog.filter((c) => c.itemType === 'product').map((c) => ({ productId: c.refId, name: c.name, category: c.category, listUnitCents: c.priceCents, setupFeeCents: c.setupFeeCents, eligible: c.eligible })),
    clients: ((clients ?? []) as Row[]).map((c) => ({ id: c.id, name: c.name, email: c.email })),
  }
}

/** Public pay page (no login): id + token through a security-definer RPC. */
export async function loadPublicInvoice(id: string, token: string): Promise<PublicInvoice | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f]{16,128}$/i.test(token)) return null
  const db = await createClient()
  const { data } = await db.rpc('public_invoice', { p_id: id, p_token: token })
  if (!data) return null
  const d = data as Row
  return {
    id: d.id, title: d.title, memo: d.memo, status: d.status, dueDate: d.due_date, businessName: d.business_name, clientName: d.client_name,
    lines: (d.lines as Row[]).map((l) => ({ name: l.name, description: l.description, quantity: l.quantity, unitCents: Number(l.unit_cents) })),
    setupFeeCents: Number(d.setup_fee_cents), deliveryFeeCents: Number(d.delivery_fee_cents), taxCents: Number(d.tax_cents),
    totalCents: Number(d.total_cents), paidCents: Number(d.paid_cents),
    payments: (d.payments as Row[]).map((p) => ({ label: p.label, amountCents: Number(p.amount_cents), dueDate: p.due_date, status: p.status, number: p.number, url: p.url, pdf: p.pdf })),
  }
}
