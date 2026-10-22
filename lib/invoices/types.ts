import type { DisplayStatus, InvoiceStatus } from './math'
import type { PlanMode } from '@/lib/carts/pricing'
import type { MembershipStatus } from '@/lib/membership/policy'

export type InvoiceLineView = {
  id: string
  kind: 'catalog' | 'custom'
  productId: string | null
  name: string
  description: string
  quantity: number
  /** catalog */
  listUnitCents: number
  setupFeeCents: number
  eligible: boolean
  markupBps: number | null
  /** custom: the planner's unit price; catalog: computed client price */
  unitCents: number
  taxable: boolean
}

export type InvoicePaymentView = {
  id: string
  label: string
  amountCents: number
  applicationFeeCents: number
  platformFeeCents: number
  stripeFeeCents: number | null
  dueDate: string | null
  status: InvoiceStatus
  number: string | null
  hostedUrl: string | null
  pdfUrl: string | null
}

export type ClientView = { id: string; name: string; email: string; phone: string | null; company: string | null; invoiceCount: number; openCents: number }

export type InvoiceView = {
  id: string
  plannerName: string
  client: { id: string; name: string; email: string }
  cartId: string | null
  title: string
  memo: string
  status: InvoiceStatus
  display: DisplayStatus
  planMode: PlanMode
  depositBps: number | null
  installments: number | null
  dueDate: string | null
  deliveryFeeCents: number
  taxRate: number
  totalCents: number
  primeLuxFeeCents: number
  paidCents: number
  payUrl: string | null
  lines: InvoiceLineView[]
  payments: InvoicePaymentView[]
}

export type InvoiceSummary = Pick<InvoiceView, 'id' | 'title' | 'status' | 'display' | 'dueDate' | 'totalCents' | 'paidCents' | 'primeLuxFeeCents'> & { clientName: string; plannerName: string; createdAt: string }

export type InvoiceContext = {
  memberStatus: MembershipStatus
  canInvoice: boolean
  connectReady: boolean
  memberActive: boolean
  memberDiscountBps: number
  maxLineDiscountBps: number
  /** Prime Lux platform/service fee config (deducted from the planner's proceeds). */
  platformFee: import('@/lib/carts/split').PlatformFeeConfig
  marketplaceFacilitator: boolean
  catalog: { productId: string; name: string; category: string; listUnitCents: number; setupFeeCents: number; eligible: boolean }[]
  clients: { id: string; name: string; email: string }[]
}

/** Client-safe public pay view (RPC public_invoice). */
export type PublicInvoice = {
  id: string; title: string; memo: string | null; status: InvoiceStatus; dueDate: string | null
  businessName: string; clientName: string
  lines: { name: string; description: string | null; quantity: number; unitCents: number }[]
  setupFeeCents: number; deliveryFeeCents: number; taxCents: number; totalCents: number; paidCents: number
  payments: { label: string; amountCents: number; dueDate: string | null; status: InvoiceStatus; number: string | null; url: string | null; pdf: string | null }[]
}
