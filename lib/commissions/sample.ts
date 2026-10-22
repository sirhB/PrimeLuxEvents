import type { EarningsData, LedgerData, PlannerLedgerRow } from './types'

/** Mock data for /preview routes. No real people, accounts, or money. */
const planners: PlannerLedgerRow[] = [
  { id: 'p-ava', name: 'Ava Laurent', whopAccountId: 'biz_demoAva01', kycStatus: 'approved', rateBps: 1200, earnTrigger: null, pendingCents: 0, earnedCents: 186000, heldCents: 0, paidCents: 412000, owedBackCents: 0 },
  { id: 'p-marco', name: 'Marco Reyes', whopAccountId: 'biz_demoMarco2', kycStatus: 'pending', rateBps: null, earnTrigger: 'deposit', pendingCents: 0, earnedCents: 64000, heldCents: 38000, paidCents: 120000, owedBackCents: 0 },
  { id: 'p-june', name: 'June Okafor', whopAccountId: null, kycStatus: 'not_started', rateBps: 800, earnTrigger: null, pendingCents: 0, earnedCents: 0, heldCents: 0, paidCents: 0, owedBackCents: 12000 },
]

export function sampleLedger(): LedgerData {
  return {
    whopConfigured: true,
    settings: { defaultRateBps: 1000, earnTrigger: 'final_payment', autoTransfer: true, currency: 'usd' },
    planners,
    events: [
      { leadId: 'e1', title: 'Harper & Cole wedding', eventDate: '2026-11-14', plannerId: 'p-ava', plannerName: 'Ava Laurent', rateBps: 1200, rateOverrideBps: null, earnTrigger: 'final_payment', triggerOverride: null, collectedCents: 1550000, commissionCents: 186000, state: 'earned' },
      { leadId: 'e2', title: 'Meridian Q4 gala', eventDate: '2026-12-05', plannerId: 'p-ava', plannerName: 'Ava Laurent', rateBps: 1500, rateOverrideBps: 1500, earnTrigger: 'final_payment', triggerOverride: null, collectedCents: 600000, commissionCents: 0, state: 'pending' },
      { leadId: 'e3', title: 'Sato 40th birthday', eventDate: '2026-10-30', plannerId: 'p-marco', plannerName: 'Marco Reyes', rateBps: 1000, rateOverrideBps: null, earnTrigger: 'deposit', triggerOverride: null, collectedCents: 380000, commissionCents: 38000, state: 'held' },
      { leadId: 'e4', title: 'Bellweather rehearsal dinner', eventDate: '2026-09-19', plannerId: 'p-ava', plannerName: 'Ava Laurent', rateBps: 1200, rateOverrideBps: null, earnTrigger: 'final_payment', triggerOverride: null, collectedCents: 3433333, commissionCents: 412000, state: 'paid' },
      { leadId: 'e5', title: 'Lindqvist engagement party', eventDate: '2026-10-02', plannerId: 'p-june', plannerName: 'June Okafor', rateBps: 800, rateOverrideBps: null, earnTrigger: 'final_payment', triggerOverride: null, collectedCents: 0, commissionCents: 0, state: 'reversed' },
    ],
    entries: [
      { id: 'c1', leadId: 'e1', eventTitle: 'Harper & Cole wedding', plannerName: 'Ava Laurent', entryType: 'accrual', amountCents: 186000, status: 'earned', reason: 'Final payment cleared', createdAt: '2026-10-20T15:12:00Z' },
      { id: 'c2', leadId: 'e3', eventTitle: 'Sato 40th birthday', plannerName: 'Marco Reyes', entryType: 'accrual', amountCents: 38000, status: 'held', reason: 'Chargeback open', createdAt: '2026-10-18T19:40:00Z' },
      { id: 'c3', leadId: 'e5', eventTitle: 'Lindqvist engagement party', plannerName: 'June Okafor', entryType: 'reversal', amountCents: -12000, status: 'earned', reason: 'Refund or chargeback', createdAt: '2026-10-11T13:05:00Z' },
      { id: 'c4', leadId: 'e4', eventTitle: 'Bellweather rehearsal dinner', plannerName: 'Ava Laurent', entryType: 'accrual', amountCents: 412000, status: 'paid', reason: 'Transfer tr_demo91', createdAt: '2026-09-22T16:30:00Z' },
    ],
  }
}

export function sampleEarnings(): EarningsData {
  const l = sampleLedger()
  const me = l.planners[0]
  return {
    whopConfigured: true,
    planner: me,
    settings: l.settings,
    events: l.events.filter((e) => e.plannerId === me.id),
    entries: l.entries.filter((e) => e.plannerName === me.name),
    links: [
      { id: 'k1', leadId: 'e2', eventTitle: 'Meridian Q4 gala', kind: 'final', amountCents: 900000, purchaseUrl: 'https://whop.com/checkout/demo', status: 'open', createdAt: '2026-10-19T14:00:00Z' },
      { id: 'k2', leadId: 'e2', eventTitle: 'Meridian Q4 gala', kind: 'deposit', amountCents: 600000, purchaseUrl: null, status: 'paid', createdAt: '2026-09-28T14:00:00Z' },
    ],
  }
}
