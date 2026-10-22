import type { EarnTrigger, LedgerSummary, PaymentKind } from './calc'

export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected'
export type EventCommissionState = 'pending' | 'earned' | 'held' | 'paid' | 'reversed'

export type CommissionSettingsView = { defaultRateBps: number; earnTrigger: EarnTrigger; autoTransfer: boolean; currency: string }

export type PlannerLedgerRow = LedgerSummary & {
  id: string
  name: string
  whopAccountId: string | null
  kycStatus: KycStatus
  rateBps: number | null
  earnTrigger: EarnTrigger | null
}

export type EventLedgerRow = {
  leadId: string
  title: string
  eventDate: string | null
  plannerId: string
  plannerName: string
  rateBps: number
  rateOverrideBps: number | null
  earnTrigger: EarnTrigger
  triggerOverride: EarnTrigger | null
  collectedCents: number
  commissionCents: number
  state: EventCommissionState
}

export type EntryRow = {
  id: string
  leadId: string
  eventTitle: string
  plannerName: string
  entryType: 'accrual' | 'reversal'
  amountCents: number
  status: string
  reason: string | null
  createdAt: string
}

export type CheckoutLinkRow = {
  id: string
  leadId: string
  eventTitle: string
  kind: PaymentKind
  amountCents: number
  purchaseUrl: string | null
  status: 'open' | 'paid' | 'void'
  createdAt: string
}

export type LedgerData = {
  settings: CommissionSettingsView
  planners: PlannerLedgerRow[]
  events: EventLedgerRow[]
  entries: EntryRow[]
  whopConfigured: boolean
}

export type EarningsData = {
  planner: PlannerLedgerRow
  settings: CommissionSettingsView
  events: EventLedgerRow[]
  entries: EntryRow[]
  links: CheckoutLinkRow[]
  whopConfigured: boolean
}
