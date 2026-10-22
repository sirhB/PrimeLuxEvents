import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { readWebhookHeaders, verifyWebhook, WebhookVerificationError } from '@/lib/whop/webhook'
import { recomputeEventCommission, transferPlannerEarnings } from '@/lib/commissions/sync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Obj = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : undefined)
const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) : undefined)
const cents = (major: unknown) => Math.round((num(major) ?? 0) * 100)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Whop webhook. Verifies the Standard Webhooks signature on the raw body, then claims
 * the webhook-id in whop_webhook_events (primary key) so a redelivery is a no-op.
 */
export async function POST(request: Request) {
  const body = await request.text()
  let webhookId: string
  try {
    const headers = readWebhookHeaders(request.headers)
    verifyWebhook(body, headers, process.env.WHOP_WEBHOOK_SECRET ?? '')
    webhookId = headers.id
  } catch (err) {
    const msg = err instanceof WebhookVerificationError ? err.message : 'Invalid webhook'
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  let event: { type?: string; data?: Obj }
  try { event = JSON.parse(body) } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  const type = event.type ?? 'unknown'
  const data = event.data ?? {}

  const db = createServiceRoleClient()
  const { error: claimError } = await db.from('whop_webhook_events').insert({ webhook_id: webhookId, event_type: type })
  if (claimError) {
    if (claimError.code === '23505') {
      const { data: prior } = await db.from('whop_webhook_events').select('status').eq('webhook_id', webhookId).maybeSingle()
      // Already processed (or ignored): acknowledge. A failed attempt is retried below.
      if (prior?.status !== 'failed') return NextResponse.json({ ok: true, duplicate: true })
      await db.from('whop_webhook_events').update({ status: 'processing', error: null }).eq('webhook_id', webhookId)
    } else {
      return NextResponse.json({ error: 'Could not record event' }, { status: 500 })
    }
  }

  try {
    const handled = await handle(db, type, data, webhookId)
    await db.from('whop_webhook_events')
      .update({ status: handled ? 'processed' : 'ignored', processed_at: new Date().toISOString() })
      .eq('webhook_id', webhookId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    await db.from('whop_webhook_events')
      .update({ status: 'failed', error: (err as Error).message.slice(0, 500) })
      .eq('webhook_id', webhookId)
    // 500 makes Whop retry; the failed row lets the retry through.
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

type Db = ReturnType<typeof createServiceRoleClient>

async function handle(db: Db, type: string, data: Obj, webhookId: string): Promise<boolean> {
  switch (type) {
    case 'payment.succeeded':
      return onPayment(db, data, webhookId)
    case 'refund.created':
    case 'refund.updated':
      return onRefund(db, data, webhookId)
    case 'dispute.created':
    case 'dispute.updated':
      return onDispute(db, data, webhookId)
    case 'transfer.completed':
    case 'transfer.failed':
      return onTransfer(db, type, data)
    case 'verification.succeeded':
      return onVerification(db, data)
    default:
      return false
  }
}

async function onPayment(db: Db, p: Obj, webhookId: string) {
  const meta = (p.metadata ?? {}) as Obj
  const leadId = str(meta.lead_id)
  const plannerId = str(meta.planner_user_id)
  const kind = str(meta.kind)
  const paymentId = str(p.id)
  // Not a Prime Lux planner checkout (e.g. some other product): ignore.
  if (!paymentId || !leadId || !plannerId || !UUID.test(leadId) || !UUID.test(plannerId)) return false
  if (kind !== 'deposit' && kind !== 'installment' && kind !== 'final') return false

  const linkId = str(meta.checkout_link_id)
  await db.from('whop_payments').upsert({
    whop_payment_id: paymentId,
    checkout_link_id: linkId && UUID.test(linkId) ? linkId : null,
    lead_id: leadId,
    planner_user_id: plannerId,
    kind,
    amount_cents: cents(p.total ?? p.subtotal ?? p.final_amount),
    refunded_cents: cents(p.refunded_amount),
    currency: str(p.currency)?.toLowerCase() ?? 'usd',
    paid_at: str(p.paid_at) ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'whop_payment_id' })
  if (linkId && UUID.test(linkId)) await db.from('whop_checkout_links').update({ status: 'paid' }).eq('id', linkId)

  const result = await recomputeEventCommission(db, leadId, webhookId)
  await maybeAutoTransfer(db, result)
  return true
}

function paymentIdOf(o: Obj) {
  const p = o.payment as Obj | string | undefined
  return typeof p === 'string' ? p : str(p?.id) ?? str(o.payment_id)
}

async function onRefund(db: Db, r: Obj, webhookId: string) {
  const paymentId = paymentIdOf(r)
  if (!paymentId) return false
  const { data: row } = await db.from('whop_payments').select('id, lead_id, amount_cents, refunded_cents').eq('whop_payment_id', paymentId).maybeSingle()
  if (!row) return false
  const status = str(r.status)
  if (status && !['succeeded', 'pending', 'processing'].includes(status)) return true
  // Refund events can repeat per refund id; use the payment's refunded total when present.
  const payment = r.payment as Obj | undefined
  const total = payment && payment.refunded_amount != null ? cents(payment.refunded_amount) : Number(row.refunded_cents) + cents(r.amount)
  await db.from('whop_payments')
    .update({ refunded_cents: Math.min(Number(row.amount_cents), total), updated_at: new Date().toISOString() })
    .eq('id', row.id)
  await recomputeEventCommission(db, row.lead_id, webhookId)
  return true
}

async function onDispute(db: Db, d: Obj, webhookId: string) {
  const paymentId = paymentIdOf(d)
  if (!paymentId) return false
  const { data: row } = await db.from('whop_payments').select('id, lead_id').eq('whop_payment_id', paymentId).maybeSingle()
  if (!row) return false
  const s = (str(d.status) ?? '').toLowerCase()
  const dispute_status = s.includes('won') ? 'won' : s.includes('lost') ? 'lost' : 'open'
  await db.from('whop_payments').update({ dispute_status, updated_at: new Date().toISOString() }).eq('id', row.id)
  await recomputeEventCommission(db, row.lead_id, webhookId)
  return true
}

async function onTransfer(db: Db, type: string, t: Obj) {
  const transferId = str(t.id)
  if (!transferId) return false
  const ok = type === 'transfer.completed'
  const { error } = await db.from('commission_entries')
    .update({ status: ok ? 'paid' : 'failed', paid_at: ok ? new Date().toISOString() : null })
    .eq('reason', `Transfer ${transferId}`).eq('status', 'transferring')
  if (error) throw new Error(error.message)
  return true
}

async function onVerification(db: Db, v: Obj) {
  const accountId = str(v.account_id) ?? str((v.account as Obj | undefined)?.id) ?? str((v.company as Obj | undefined)?.id)
  if (!accountId) return false
  await db.from('planner_payout_profiles')
    .update({ kyc_status: 'approved', updated_at: new Date().toISOString() })
    .eq('whop_account_id', accountId)
  return true
}

async function maybeAutoTransfer(db: Db, result: { written: boolean; plannerId?: string }) {
  if (!result.written || !result.plannerId) return
  const { data: settings } = await db.from('commission_settings').select('auto_transfer').eq('id', 1).maybeSingle()
  if (settings?.auto_transfer) await transferPlannerEarnings(db, result.plannerId)
}
