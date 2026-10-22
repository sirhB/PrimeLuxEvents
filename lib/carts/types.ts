import type { MembershipStatus } from '@/lib/membership/policy'
import type { PlatformFeeConfig } from './split'

export type CartStatus = 'draft' | 'shared' | 'approved' | 'paid' | 'ordered' | 'void'
export type CartItemType = 'product' | 'package' | 'venue'

/** Planner/admin view of a line: includes cost and margin. */
export type CartLineView = {
  id: string
  itemType: CartItemType
  refId: string | null
  name: string
  imageUrl: string | null
  listUnitCents: number
  eligible: boolean
  clientUnitCents: number | null
  markupBps: number | null
  setupFeeCents: number
  quantity: number
  discountBps: number
  note: string
}

export type CatalogPick = {
  itemType: CartItemType
  refId: string
  name: string
  category: string
  priceCents: number
  setupFeeCents: number
  imageUrl: string | null
  eligible: boolean
}

export type CartLimits = {
  memberDiscountBps: number; maxLineDiscountBps: number; defaultDepositBps: number
  /** Prime Lux platform/service fee (admin-defined, default 0). Deducted from planner proceeds. */
  platformFee: PlatformFeeConfig
  /** Prime Lux collects sales tax as a marketplace facilitator (off by default; CPA review pending). */
  marketplaceFacilitator: boolean
}

export type CartPaymentView = {
  id: string
  kind: 'deposit' | 'installment' | 'final'
  label: string
  amountCents: number
  url: string | null
  status: 'open' | 'paid' | 'void'
  /** Planner/admin only (never loaded for clients): the read-only Connect split. */
  split?: {
    applicationFeeCents: number
    platformFeeCents: number
    stripeFeeCents: number | null
    refundedCents: number
    feeRefundedCents: number
    disputeStatus: 'none' | 'open' | 'won' | 'lost'
  }
}

export type ConnectView = { ready: boolean; started: boolean; payoutsEnabled: boolean }

export type CartView = {
  id: string
  leadId: string
  eventTitle: string
  eventDate: string | null
  clientName: string
  plannerName: string
  title: string
  status: CartStatus
  noteToClient: string
  defaultMarkupBps: number | null
  deliveryFeeCents: number
  taxRate: number
  lines: CartLineView[]
  paidCents: number
  orderId: string | null
  approvedAt: string | null
  updatedAt: string
  payments: CartPaymentView[]
}

/** Client-safe quote: client prices only. */
export type QuoteLine = { id: string; name: string; clientUnitCents: number; setupFeeCents: number; quantity: number; discountBps: number; note: string }
export type QuoteView = {
  id: string
  title: string
  status: CartStatus
  plannerName: string
  eventDate: string | null
  noteToClient: string
  lines: QuoteLine[]
  subtotalCents: number
  setupFeeCents: number
  deliveryFeeCents: number
  taxCents: number
  totalCents: number
  paidCents: number
  payments: CartPaymentView[]
}

export type CartSummary = Pick<CartView, 'id' | 'leadId' | 'eventTitle' | 'eventDate' | 'clientName' | 'plannerName' | 'title' | 'status' | 'paidCents' | 'orderId' | 'updatedAt'> & { totalCents: number; marginCents: number }

export type PlannerCartContext = {
  limits: CartLimits
  memberStatus: MembershipStatus
  memberActive: boolean
  catalog: CatalogPick[]
  stripeConfigured: boolean
  /** Planner's Stripe Connect status; payment links are blocked until ready. */
  connect: ConnectView
}
