/**
 * Pure planner-cart pricing. No I/O, no path aliases (scripts/check-carts.mjs imports it).
 *
 * Per line:
 *   list   = site price (same as the public cart)
 *   cost   = what the planner pays: list minus the member discount (50%) when the line is
 *            eligible AND the planner's membership is active; otherwise list
 *   client = what the client pays: an explicit price, or cost + markup %, or list by default.
 *            Never below cost.
 *   Line discounts (admin-capped) only apply to lines WITHOUT the member discount (no stacking),
 *   and never take the client price below cost.
 * Cart: tax on client merchandise + setup (not delivery), like the site checkout.
 * Margin = client merchandise - planner cost: the planner's markup (kept via the Connect split).
 */

export type PricingLineInput = {
  listUnitCents: number
  setupFeeCents?: number
  quantity: number
  eligible: boolean
  /** Explicit client unit price. Wins over markup. */
  clientUnitCents?: number | null
  /** Markup on cost in basis points (2500 = +25%). Used when no explicit price. */
  markupBps?: number | null
  /** Requested line discount. Ignored on member-discounted lines. */
  discountBps?: number
}

export type PricingContext = {
  memberActive: boolean
  memberDiscountBps: number
  maxLineDiscountBps: number
  /** Cart-level markup used when a line has neither price nor markup. null = list price. */
  defaultMarkupBps?: number | null
}

export type PricedLine = {
  quantity: number
  listUnitCents: number
  costUnitCents: number
  clientUnitCents: number
  memberDiscounted: boolean
  discountBps: number
  discountBlocked: boolean
  clientNetCents: number
  costCents: number
  marginCents: number
  setupCents: number
}

export type CartPricing = {
  lines: PricedLine[]
  listCents: number
  subtotalCents: number
  discountCents: number
  setupFeeCents: number
  deliveryFeeCents: number
  taxCents: number
  totalCents: number
  costCents: number
  marginCents: number
  memberSavingsCents: number
}

const int = (n: unknown, min = 0) => {
  const v = typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : 0
  return Math.max(min, v)
}

export function memberCost(listUnitCents: number, eligible: boolean, ctx: Pick<PricingContext, 'memberActive' | 'memberDiscountBps'>): number {
  const list = int(listUnitCents)
  if (!eligible || !ctx.memberActive) return list
  const bps = Math.min(10000, int(ctx.memberDiscountBps))
  return list - Math.round((list * bps) / 10000)
}

export function priceLine(line: PricingLineInput, ctx: PricingContext): PricedLine {
  const qty = Math.min(10000, Math.max(1, int(line.quantity, 1)))
  const list = int(line.listUnitCents)
  const cost = memberCost(list, line.eligible, ctx)
  const memberDiscounted = cost < list

  let client: number
  if (line.clientUnitCents != null) client = int(line.clientUnitCents)
  else if (line.markupBps != null) client = cost + Math.round((cost * int(line.markupBps)) / 10000)
  else if (ctx.defaultMarkupBps != null) client = cost + Math.round((cost * int(ctx.defaultMarkupBps)) / 10000)
  else client = list
  client = Math.max(cost, client)

  const asked = int(line.discountBps)
  const discountBlocked = memberDiscounted && asked > 0
  let discountBps = memberDiscounted ? 0 : Math.min(asked, Math.min(10000, int(ctx.maxLineDiscountBps)))
  // Never discount below cost.
  if (discountBps > 0 && client > 0) {
    const floorBps = Math.floor(((client - cost) * 10000) / client)
    discountBps = Math.min(discountBps, Math.max(0, floorBps))
  }
  const gross = client * qty
  const clientNet = gross - Math.round((gross * discountBps) / 10000)
  const costTotal = cost * qty
  return {
    quantity: qty,
    listUnitCents: list,
    costUnitCents: cost,
    clientUnitCents: client,
    memberDiscounted,
    discountBps,
    discountBlocked,
    clientNetCents: clientNet,
    costCents: costTotal,
    marginCents: clientNet - costTotal,
    setupCents: int(line.setupFeeCents) * qty,
  }
}

export function priceCart(lines: PricingLineInput[], ctx: PricingContext, fees: { deliveryFeeCents?: number; taxRate?: number } = {}): CartPricing {
  const rows = lines.map((l) => priceLine(l, ctx))
  const sum = (f: (r: PricedLine) => number) => rows.reduce((s, r) => s + f(r), 0)
  const subtotalCents = sum((r) => r.clientNetCents)
  const setupFeeCents = sum((r) => r.setupCents)
  const deliveryFeeCents = int(fees.deliveryFeeCents)
  const rate = typeof fees.taxRate === 'number' && fees.taxRate >= 0 && fees.taxRate < 1 ? fees.taxRate : 0
  const taxCents = Math.round((subtotalCents + setupFeeCents) * rate)
  return {
    lines: rows,
    listCents: sum((r) => r.listUnitCents * r.quantity),
    subtotalCents,
    discountCents: sum((r) => r.clientUnitCents * r.quantity - r.clientNetCents),
    setupFeeCents,
    deliveryFeeCents,
    taxCents,
    totalCents: subtotalCents + setupFeeCents + deliveryFeeCents + taxCents,
    costCents: sum((r) => r.costCents),
    marginCents: sum((r) => r.marginCents),
    memberSavingsCents: sum((r) => (r.listUnitCents - r.costUnitCents) * r.quantity),
  }
}

/** Markup % implied by a client price over cost (for display). */
export function markupPct(costUnitCents: number, clientUnitCents: number): number {
  if (costUnitCents <= 0) return 0
  return Math.round(((clientUnitCents - costUnitCents) / costUnitCents) * 1000) / 10
}

// ---------------------------------------------------------------------------
// Payment plan splitter (provider-neutral)
// ---------------------------------------------------------------------------
export type PlanMode = 'full' | 'deposit' | 'installments'
export type PlannedPayment = { kind: 'deposit' | 'installment' | 'final'; amountCents: number; label: string }
export type PaymentPlan = { payments: PlannedPayment[]; warnings: string[] }

/** n near-equal parts that sum exactly to the amount (earlier parts take the extra cents). */
export function splitEven(amountCents: number, parts: number): number[] {
  const n = Math.max(1, Math.floor(parts))
  if (amountCents <= 0) return []
  const base = Math.floor(amountCents / n)
  const rem = amountCents - base * n
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0))
}

/**
 * Payments for what's still owed. Optional per-payment cap splits oversized steps.
 * The last payment is marked `final`.
 */
export function planPayments(input: {
  totalCents: number
  paidCents?: number
  mode: PlanMode
  depositBps?: number
  installments?: number
  capCents?: number | null
}): PaymentPlan {
  const owed = Math.max(0, int(input.totalCents) - int(input.paidCents))
  if (owed === 0) return { payments: [], warnings: ['Nothing left to collect'] }
  const steps: { kind: 'deposit' | 'installment'; amount: number; label: string }[] = []
  if (input.mode === 'full') {
    steps.push({ kind: 'installment', amount: owed, label: 'Payment in full' })
  } else if (input.mode === 'deposit') {
    const bps = Math.min(10000, Math.max(100, int(input.depositBps ?? 3000)))
    const deposit = Math.min(owed, Math.round((owed * bps) / 10000))
    steps.push({ kind: 'deposit', amount: deposit, label: `Deposit (${bps / 100}%)` })
    if (owed - deposit > 0) steps.push({ kind: 'installment', amount: owed - deposit, label: 'Balance' })
  } else {
    const n = Math.min(12, Math.max(2, int(input.installments ?? 3, 2)))
    splitEven(owed, n).forEach((a, i) => steps.push({ kind: 'installment', amount: a, label: `Installment ${i + 1} of ${n}` }))
  }
  const warnings: string[] = []
  const payments: PlannedPayment[] = []
  const cap = input.capCents && input.capCents > 0 ? int(input.capCents) : null
  for (const s of steps) {
    const parts = cap ? splitEven(s.amount, Math.ceil(s.amount / cap)) : [s.amount]
    if (parts.length > 1 && !warnings.length) warnings.push('Some payments were split to stay under the per-payment limit.')
    parts.forEach((a, i) => payments.push({ kind: s.kind, amountCents: a, label: parts.length > 1 ? `${s.label} · part ${i + 1}/${parts.length}` : s.label }))
  }
  payments[payments.length - 1].kind = 'final'
  return { payments, warnings }
}
