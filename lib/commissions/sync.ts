import type { SupabaseClient } from '@supabase/supabase-js'
import { computeTarget, ledgerDelta, ledgerTotal, transferableCents, type EarnTrigger, type LedgerRow, type PaymentFact } from './calc'
import { createTransfer, whopConfigured } from '@/lib/whop/client'

type Db = SupabaseClient

/**
 * Recompute the commission for one event and write the ledger delta.
 * Safe to call any number of times: a second call with the same facts writes nothing.
 */
export async function recomputeEventCommission(db: Db, leadId: string, sourceEventId?: string) {
  const [{ data: terms }, { data: settings }, { data: payments }] = await Promise.all([
    db.from('event_commission_terms').select('*').eq('lead_id', leadId).maybeSingle(),
    db.from('commission_settings').select('*').eq('id', 1).maybeSingle(),
    db.from('whop_payments').select('kind, amount_cents, refunded_cents, dispute_status, planner_user_id').eq('lead_id', leadId),
  ])
  const plannerId: string | undefined = terms?.planner_user_id ?? payments?.[0]?.planner_user_id
  if (!plannerId) return { written: false, reason: 'No planner for event' }

  const { data: profile } = await db
    .from('planner_payout_profiles').select('rate_bps, earn_trigger').eq('planner_user_id', plannerId).maybeSingle()

  const facts: PaymentFact[] = (payments ?? []).map((p) => ({
    kind: p.kind, amountCents: Number(p.amount_cents), refundedCents: Number(p.refunded_cents), disputeStatus: p.dispute_status,
  }))
  const target = computeTarget(
    facts,
    { defaultRateBps: settings?.default_rate_bps ?? 1000, plannerRateBps: profile?.rate_bps, eventRateBps: terms?.rate_bps_override },
    {
      defaultTrigger: (settings?.earn_trigger ?? 'final_payment') as EarnTrigger,
      plannerTrigger: profile?.earn_trigger as EarnTrigger | null,
      eventTrigger: terms?.earn_trigger_override as EarnTrigger | null,
    },
  )

  const { data: entries } = await db
    .from('commission_entries').select('id, amount_cents, status').eq('lead_id', leadId).eq('planner_user_id', plannerId)
  const counted = (entries ?? []).filter((e) => e.status !== 'reversed' && e.status !== 'offset')

  // Chargeback open: freeze unpaid entries; release them when it resolves.
  if (target.state === 'held') {
    await db.from('commission_entries').update({ status: 'held', reason: target.reason })
      .eq('lead_id', leadId).eq('planner_user_id', plannerId).in('status', ['earned', 'failed'])
    return { written: false, reason: target.reason }
  }
  await db.from('commission_entries').update({ status: 'earned' })
    .eq('lead_id', leadId).eq('planner_user_id', plannerId).eq('status', 'held')

  const delta = ledgerDelta(target, ledgerTotal(counted.map((e) => ({ amountCents: Number(e.amount_cents) }))))
  if (delta.kind === 'none') return { written: false, reason: 'No change' }

  await db.from('commission_entries').insert({
    lead_id: leadId,
    planner_user_id: plannerId,
    entry_type: delta.kind,
    amount_cents: delta.amountCents,
    basis_cents: target.basisCents,
    rate_bps: target.rateBps,
    status: 'earned',
    reason: delta.kind === 'reversal' ? 'Refund or chargeback' : target.reason,
    source_event_id: sourceEventId ?? null,
  })
  return { written: true, reason: target.reason, plannerId }
}

/**
 * Transfer a planner's unpaid, earned balance (net of reversals) to their Whop account.
 * One transfer per run with an idempotence key derived from the entry ids, so a retry
 * of the same batch can never pay twice.
 */
export async function transferPlannerEarnings(db: Db, plannerId: string) {
  if (!whopConfigured()) return { ok: false, reason: 'Whop is not configured' }
  const { data: profile } = await db
    .from('planner_payout_profiles').select('whop_account_id, kyc_status').eq('planner_user_id', plannerId).maybeSingle()
  if (!profile?.whop_account_id) return { ok: false, reason: 'Planner has no Whop account' }
  if (profile.kyc_status !== 'approved') return { ok: false, reason: 'Planner KYC not approved' }

  const { data: settings } = await db.from('commission_settings').select('currency').eq('id', 1).maybeSingle()
  const { data: rows } = await db
    .from('commission_entries').select('id, lead_id, amount_cents, status')
    .eq('planner_user_id', plannerId).in('status', ['earned', 'failed']).order('created_at')
  const batch = rows ?? []
  const ledger: LedgerRow[] = batch.map((r) => ({ plannerId, leadId: r.lead_id, amountCents: Number(r.amount_cents), status: r.status }))
  const amount = transferableCents(ledger)
  if (amount <= 0) return { ok: false, reason: 'Nothing to transfer' }

  const ids = batch.map((r) => r.id).sort()
  const key = `commission-${plannerId.slice(0, 8)}-${await shortHash(ids.join(','))}`
  await db.from('commission_entries').update({ status: 'transferring', transfer_idempotency_key: null }).in('id', ids)

  try {
    const transfer = await createTransfer({
      destinationAccountId: profile.whop_account_id,
      amountCents: amount,
      currency: settings?.currency ?? 'usd',
      idempotenceKey: key,
      metadata: { planner_user_id: plannerId, entries: String(ids.length) },
    })
    const paid = transfer.status === 'succeeded'
    // The key and transfer id live on the first row; the rest of the batch shares status.
    await db.from('commission_entries').update({ whop_transfer_id: transfer.id, transfer_idempotency_key: key }).eq('id', ids[0])
    await db.from('commission_entries')
      .update({ status: paid ? 'paid' : 'transferring', paid_at: paid ? new Date().toISOString() : null, reason: `Transfer ${transfer.id}` })
      .in('id', ids)
    return { ok: true, transferId: transfer.id, amountCents: amount, status: transfer.status }
  } catch (err) {
    await db.from('commission_entries').update({ status: 'failed', reason: (err as Error).message.slice(0, 300) }).in('id', ids)
    return { ok: false, reason: (err as Error).message }
  }
}

async function shortHash(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
}
