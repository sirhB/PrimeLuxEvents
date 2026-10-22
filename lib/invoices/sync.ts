import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireStripe } from '@/lib/stripe'
import { stripeFeeForIntent } from '@/lib/connect/events'

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** Mirror one Stripe invoice (a scheduled payment) onto our rows, then roll up the parent invoice. */
export async function syncInvoiceFromStripe(db: SupabaseClient, account: string, inv: Stripe.Invoice) {
  const status = (['draft', 'open', 'paid', 'void', 'uncollectible'] as const).includes(inv.status as never) ? inv.status : 'open'
  const patch: Row = { status, number: inv.number, hosted_invoice_url: inv.hosted_invoice_url, invoice_pdf: inv.invoice_pdf }
  if (status === 'paid') {
    patch.paid_at = new Date((inv.status_transitions?.paid_at ?? Date.now() / 1000) * 1000).toISOString()
    try {
      const pays = await requireStripe().invoicePayments.list({ invoice: inv.id, limit: 3 }, { stripeAccount: account })
      const pi = pays.data.map((p) => p.payment?.payment_intent).find(Boolean)
      const piId = typeof pi === 'string' ? pi : pi?.id
      if (piId) patch.stripe_fee_cents = (await stripeFeeForIntent(account, piId)).fee
    } catch { /* fee shows as pending */ }
  }
  const { data: row } = await db.from('planner_invoice_payments').update(patch).eq('stripe_invoice_id', inv.id).select('invoice_id').maybeSingle()
  if (row) await rollUpInvoice(db, row.invoice_id)
}

export async function rollUpInvoice(db: SupabaseClient, invoiceId: string) {
  const { data: pays } = await db.from('planner_invoice_payments').select('status, amount_cents').eq('invoice_id', invoiceId)
  const ps = (pays ?? []) as Row[]
  const live = ps.filter((p) => p.status !== 'void')
  const paid = live.filter((p) => p.status === 'paid').reduce((a, p) => a + Number(p.amount_cents), 0)
  const status = !live.length ? 'void'
    : live.every((p) => p.status === 'paid') ? 'paid'
    : live.some((p) => p.status === 'uncollectible') ? 'uncollectible'
    : live.some((p) => p.status === 'open' || p.status === 'paid') ? 'open' : 'draft'
  await db.from('planner_invoices').update({ status, paid_cents: paid, updated_at: new Date().toISOString() }).eq('id', invoiceId)
}
