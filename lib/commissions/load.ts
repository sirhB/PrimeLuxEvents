import { createClient } from '@/lib/supabase/server'
import { whopConfigured } from '@/lib/whop/client'
import { computeTarget, summarize, type EarnTrigger, type LedgerRow } from './calc'
import type { CheckoutLinkRow, CommissionSettingsView, EarningsData, EntryRow, EventCommissionState, EventLedgerRow, KycStatus, LedgerData, PlannerLedgerRow } from './types'

type Row = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const FALLBACK: CommissionSettingsView = { defaultRateBps: 1000, earnTrigger: 'final_payment', autoTransfer: true, currency: 'usd' }

/** Reads through the caller's session, so RLS decides scope: admins see all, planners see their own. */
async function loadRaw(plannerId?: string) {
  const db = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scope = (q: any): PromiseLike<{ data: Row[] | null }> => (plannerId ? q.eq('planner_user_id', plannerId) : q)
  const [settings, profiles, terms, payments, entries, links] = await Promise.all([
    db.from('commission_settings').select('*').eq('id', 1).maybeSingle(),
    scope(db.from('planner_payout_profiles').select('*')),
    scope(db.from('event_commission_terms').select('*, venue_leads(contact_name, venue_name, event_date)')),
    scope(db.from('whop_payments').select('*')),
    scope(db.from('commission_entries').select('*').order('created_at', { ascending: false }).limit(500)),
    scope(db.from('whop_checkout_links').select('*').order('created_at', { ascending: false }).limit(100)),
  ])
  const s = settings.data as Row | null
  return {
    settings: s ? { defaultRateBps: s.default_rate_bps, earnTrigger: s.earn_trigger, autoTransfer: s.auto_transfer, currency: s.currency } as CommissionSettingsView : FALLBACK,
    profiles: (profiles.data ?? []) as Row[],
    terms: (terms.data ?? []) as Row[],
    payments: (payments.data ?? []) as Row[],
    entries: (entries.data ?? []) as Row[],
    links: (links.data ?? []) as Row[],
  }
}

function build(raw: Awaited<ReturnType<typeof loadRaw>>) {
  const name = new Map<string, string>()
  for (const p of raw.profiles) name.set(p.planner_user_id, p.display_name || 'Planner')
  const title = new Map<string, string>()
  for (const t of raw.terms) {
    const l = t.venue_leads as Row | null
    title.set(t.lead_id, [l?.contact_name, l?.venue_name].filter(Boolean).join(' · ') || 'Event')
  }

  const ledgerRows: LedgerRow[] = raw.entries
    .filter((e) => e.status !== 'reversed' && e.status !== 'offset')
    .map((e) => ({ plannerId: e.planner_user_id, leadId: e.lead_id, amountCents: Number(e.amount_cents), status: e.status }))

  const planners: PlannerLedgerRow[] = raw.profiles.map((p) => ({
    id: p.planner_user_id,
    name: name.get(p.planner_user_id) ?? 'Planner',
    whopAccountId: p.whop_account_id,
    kycStatus: p.kyc_status as KycStatus,
    rateBps: p.rate_bps,
    earnTrigger: p.earn_trigger,
    ...summarize(ledgerRows.filter((r) => r.plannerId === p.planner_user_id)),
  }))

  const events: EventLedgerRow[] = raw.terms.map((t) => {
    const profile = raw.profiles.find((p) => p.planner_user_id === t.planner_user_id)
    const pays = raw.payments.filter((p) => p.lead_id === t.lead_id)
    const target = computeTarget(
      pays.map((p) => ({ kind: p.kind, amountCents: Number(p.amount_cents), refundedCents: Number(p.refunded_cents), disputeStatus: p.dispute_status })),
      { defaultRateBps: raw.settings.defaultRateBps, plannerRateBps: profile?.rate_bps, eventRateBps: t.rate_bps_override },
      { defaultTrigger: raw.settings.earnTrigger, plannerTrigger: profile?.earn_trigger as EarnTrigger | null, eventTrigger: t.earn_trigger_override },
    )
    const mine = ledgerRows.filter((r) => r.leadId === t.lead_id)
    const booked = mine.reduce((s, r) => s + r.amountCents, 0)
    const hasReversal = raw.entries.some((e) => e.lead_id === t.lead_id && e.entry_type === 'reversal')
    let state: EventCommissionState = target.state
    if (target.state === 'earned' && mine.length > 0 && mine.every((r) => r.status === 'paid')) state = 'paid'
    if (target.state !== 'held' && hasReversal && target.targetCents === 0) state = 'reversed'
    return {
      leadId: t.lead_id,
      title: title.get(t.lead_id) ?? 'Event',
      eventDate: (t.venue_leads as Row | null)?.event_date ?? null,
      plannerId: t.planner_user_id,
      plannerName: name.get(t.planner_user_id) ?? 'Planner',
      rateBps: target.rateBps,
      rateOverrideBps: t.rate_bps_override,
      earnTrigger: target.trigger,
      triggerOverride: t.earn_trigger_override,
      collectedCents: target.basisCents,
      commissionCents: target.state === 'held' ? booked : target.targetCents,
      state,
    }
  })

  const entries: EntryRow[] = raw.entries.map((e) => ({
    id: e.id,
    leadId: e.lead_id,
    eventTitle: title.get(e.lead_id) ?? 'Event',
    plannerName: name.get(e.planner_user_id) ?? 'Planner',
    entryType: e.entry_type,
    amountCents: Number(e.amount_cents),
    status: e.status,
    reason: e.reason,
    createdAt: e.created_at,
  }))

  const links: CheckoutLinkRow[] = raw.links.map((k) => ({
    id: k.id, leadId: k.lead_id, eventTitle: title.get(k.lead_id) ?? 'Event', kind: k.kind,
    amountCents: Number(k.amount_cents), purchaseUrl: k.purchase_url, status: k.status, createdAt: k.created_at,
  }))

  return { planners, events, entries, links }
}

export async function loadLedger(): Promise<LedgerData> {
  const raw = await loadRaw()
  const { planners, events, entries } = build(raw)
  return { settings: raw.settings, planners, events, entries, whopConfigured: whopConfigured() }
}

export async function loadEarnings(userId: string, displayName: string): Promise<EarningsData> {
  const raw = await loadRaw(userId)
  const { planners, events, entries, links } = build(raw)
  const planner: PlannerLedgerRow = planners[0] ?? {
    id: userId, name: displayName, whopAccountId: null, kycStatus: 'not_started', rateBps: null, earnTrigger: null,
    ...summarize([]),
  }
  return { planner, settings: raw.settings, events, entries, links, whopConfigured: whopConfigured() }
}
