/**
 * Pure commission math. No I/O, no path aliases, so node can run it directly in
 * scripts/check-commissions.mjs (node --experimental-strip-types).
 *
 * Model: the ledger stores deltas. For each (event, planner) we compute the commission
 * that *should* exist right now, compare it with what the ledger already holds, and
 * write the difference: a positive accrual or a negative reversal. Refunds and lost
 * chargebacks shrink the target, so they produce reversals automatically.
 */

export type EarnTrigger = 'deposit' | 'final_payment'
export type PaymentKind = 'deposit' | 'installment' | 'final'
export type DisputeStatus = 'none' | 'open' | 'won' | 'lost'

export type PaymentFact = {
  kind: PaymentKind
  amountCents: number
  refundedCents: number
  disputeStatus: DisputeStatus
}

export type RateInputs = {
  defaultRateBps: number
  plannerRateBps?: number | null
  eventRateBps?: number | null
}

export type TriggerInputs = {
  defaultTrigger: EarnTrigger
  plannerTrigger?: EarnTrigger | null
  eventTrigger?: EarnTrigger | null
}

export type CommissionState = 'pending' | 'earned' | 'held'

export type CommissionTarget = {
  state: CommissionState
  rateBps: number
  trigger: EarnTrigger
  /** Net money collected that counts toward commission. */
  basisCents: number
  /** Commission that should exist in the ledger now (0 while pending). */
  targetCents: number
  reason: string
}

function clampBps(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.min(10000, Math.max(0, Math.round(v)))
}

/** Event override beats planner rate beats the global default. */
export function resolveRateBps(r: RateInputs): number {
  if (r.eventRateBps != null) return clampBps(r.eventRateBps)
  if (r.plannerRateBps != null) return clampBps(r.plannerRateBps)
  return clampBps(r.defaultRateBps)
}

export function resolveTrigger(t: TriggerInputs): EarnTrigger {
  return t.eventTrigger ?? t.plannerTrigger ?? t.defaultTrigger
}

/** Commission on an amount, rounded half-up to the cent. */
export function commissionCents(basisCents: number, rateBps: number): number {
  if (basisCents <= 0) return 0
  return Math.floor((basisCents * clampBps(rateBps) + 5000) / 10000)
}

/** Money that still counts: paid minus refunds, and nothing from a lost chargeback. */
export function netCents(p: PaymentFact): number {
  if (p.disputeStatus === 'lost') return 0
  return Math.max(0, p.amountCents - Math.max(0, p.refundedCents))
}

export function computeTarget(
  payments: PaymentFact[],
  rates: RateInputs,
  triggers: TriggerInputs,
): CommissionTarget {
  const rateBps = resolveRateBps(rates)
  const trigger = resolveTrigger(triggers)
  const basisCents = payments.reduce((sum, p) => sum + netCents(p), 0)

  if (payments.some((p) => p.disputeStatus === 'open')) {
    return { state: 'held', rateBps, trigger, basisCents, targetCents: 0, reason: 'Chargeback open' }
  }

  const live = payments.filter((p) => netCents(p) > 0)
  const triggered =
    trigger === 'deposit'
      ? live.length > 0
      : live.some((p) => p.kind === 'final')

  if (!triggered) {
    const waiting = trigger === 'deposit' ? 'Waiting on deposit' : 'Waiting on final payment'
    return { state: 'pending', rateBps, trigger, basisCents, targetCents: 0, reason: waiting }
  }

  return {
    state: 'earned',
    rateBps,
    trigger,
    basisCents,
    targetCents: commissionCents(basisCents, rateBps),
    reason: trigger === 'deposit' ? 'Deposit cleared' : 'Final payment cleared',
  }
}

/** Sum of ledger entries that still count (reversed/offset bookkeeping rows excluded by caller). */
export function ledgerTotal(entries: { amountCents: number }[]): number {
  return entries.reduce((s, e) => s + e.amountCents, 0)
}

export type LedgerDelta =
  | { kind: 'none' }
  | { kind: 'accrual'; amountCents: number }
  | { kind: 'reversal'; amountCents: number }

/**
 * Difference between the target and what is booked. While a chargeback is open the
 * target is 0 but nothing is reversed yet: the caller marks unpaid entries `held`.
 */
export function ledgerDelta(target: CommissionTarget, bookedCents: number): LedgerDelta {
  if (target.state === 'held') return { kind: 'none' }
  const diff = target.targetCents - bookedCents
  if (diff > 0) return { kind: 'accrual', amountCents: diff }
  if (diff < 0) return { kind: 'reversal', amountCents: diff }
  return { kind: 'none' }
}

export type LedgerRow = {
  plannerId: string
  leadId: string
  amountCents: number
  status: 'pending' | 'earned' | 'held' | 'transferring' | 'paid' | 'failed' | 'reversed' | 'offset'
}

export type LedgerSummary = { pendingCents: number; earnedCents: number; heldCents: number; paidCents: number; owedBackCents: number }

/**
 * Buckets for the ledger UI. `earned` = earned but not yet transferred.
 * A paid accrual later reversed shows up as `owedBack` until offset against new earnings.
 */
export function summarize(rows: LedgerRow[]): LedgerSummary {
  const s: LedgerSummary = { pendingCents: 0, earnedCents: 0, heldCents: 0, paidCents: 0, owedBackCents: 0 }
  for (const r of rows) {
    if (r.status === 'pending') s.pendingCents += r.amountCents
    else if (r.status === 'earned' || r.status === 'transferring' || r.status === 'failed') s.earnedCents += r.amountCents
    else if (r.status === 'held') s.heldCents += r.amountCents
    else if (r.status === 'paid') s.paidCents += r.amountCents
  }
  // Negative earned balance means reversals exceed unpaid earnings: planner owes it back.
  if (s.earnedCents < 0) {
    s.owedBackCents = -s.earnedCents
    s.earnedCents = 0
  }
  return s
}

/**
 * Amount to transfer for a planner: unpaid earned entries net of reversals.
 * Never negative. Whop transfers are major units, so the caller divides by 100.
 */
export function transferableCents(rows: LedgerRow[]): number {
  const net = rows
    .filter((r) => r.status === 'earned' || r.status === 'failed')
    .reduce((s, r) => s + r.amountCents, 0)
  return Math.max(0, net)
}

export function formatCents(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)
}
