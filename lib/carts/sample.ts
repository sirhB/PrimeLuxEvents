import type { CartSummary, CartView, PlannerCartContext, QuoteView } from './types'
import { priceCart } from './pricing'

/** Mock data for /preview routes only. No real people or money. */
export function samplePlannerContext(): PlannerCartContext {
  return {
    limits: { memberDiscountBps: 5000, maxLineDiscountBps: 1500, defaultDepositBps: 3000, platformFee: { bps: 0, flatCents: 0, minCents: null, capCents: null }, marketplaceFacilitator: false },
    memberStatus: 'active',
    memberActive: true,
    stripeConfigured: true,
    connect: { ready: true, started: true, payoutsEnabled: true },
    catalog: [
      { itemType: 'product', refId: 'pr-chiavari', name: 'Gold Chiavari chair', category: 'Seating', priceCents: 1250, setupFeeCents: 150, imageUrl: null, eligible: true },
      { itemType: 'product', refId: 'pr-farm', name: 'Farmhouse table, 8 ft', category: 'Tables', priceCents: 9500, setupFeeCents: 1500, imageUrl: null, eligible: true },
      { itemType: 'product', refId: 'pr-linen', name: 'Ivory linen, 120" round', category: 'Linens', priceCents: 2800, setupFeeCents: 0, imageUrl: null, eligible: true },
      { itemType: 'product', refId: 'pr-dance', name: 'LED dance floor, 16×16', category: 'Staging', priceCents: 120000, setupFeeCents: 25000, imageUrl: null, eligible: false },
      { itemType: 'package', refId: 'pk-garden', name: 'Garden ceremony package', category: 'Packages', priceCents: 185000, setupFeeCents: 0, imageUrl: null, eligible: false },
      { itemType: 'venue', refId: 've-loft', name: 'The Hudson Loft', category: 'Venues', priceCents: 0, setupFeeCents: 0, imageUrl: null, eligible: false },
    ],
  }
}

export function sampleCart(status: CartView['status'] = 'draft'): CartView {
  return {
    id: 'cart-demo', leadId: 'e1', eventTitle: 'Harper & Cole wedding', eventDate: '2026-11-14', clientName: 'Nora Harper', plannerName: 'Ava Laurent',
    title: 'Reception, 140 guests', status,
    noteToClient: 'Here is the reception look we talked through. Linens are held until Friday.',
    defaultMarkupBps: null, deliveryFeeCents: 12500, taxRate: 0.08875, paidCents: status === 'approved' ? 284484 : 0, orderId: null,
    approvedAt: status === 'approved' ? '2026-10-21T18:00:00Z' : null, updatedAt: '2026-10-21T16:00:00Z',
    payments: status === 'approved' ? [
      { id: 'p1', kind: 'deposit', label: 'Deposit (30%)', amountCents: 284484, url: null, status: 'paid',
        split: { applicationFeeCents: 165690, platformFeeCents: 5690, stripeFeeCents: 8280, refundedCents: 0, feeRefundedCents: 0, disputeStatus: 'none' } },
      { id: 'p2', kind: 'final', label: 'Balance', amountCents: 663797, url: 'https://buy.stripe.com/test_demo', status: 'open',
        split: { applicationFeeCents: 386576, platformFeeCents: 13276, stripeFeeCents: null, refundedCents: 0, feeRefundedCents: 0, disputeStatus: 'none' } },
    ] : [],
    lines: [
      { id: 'l1', itemType: 'product', refId: 'pr-chiavari', name: 'Gold Chiavari chair', imageUrl: null, listUnitCents: 1250, eligible: true, clientUnitCents: null, markupBps: null, setupFeeCents: 150, quantity: 140, discountBps: 0, note: 'Ivory cushions' },
      { id: 'l2', itemType: 'product', refId: 'pr-farm', name: 'Farmhouse table, 8 ft', imageUrl: null, listUnitCents: 9500, eligible: true, clientUnitCents: null, markupBps: 6000, setupFeeCents: 1500, quantity: 14, discountBps: 0, note: '' },
      { id: 'l3', itemType: 'product', refId: 'pr-dance', name: 'LED dance floor, 16×16', imageUrl: null, listUnitCents: 120000, eligible: false, clientUnitCents: null, markupBps: 1500, setupFeeCents: 25000, quantity: 1, discountBps: 500, note: '' },
      { id: 'l4', itemType: 'venue', refId: 've-loft', name: 'The Hudson Loft', imageUrl: null, listUnitCents: 350000, eligible: false, clientUnitCents: 380000, markupBps: null, setupFeeCents: 0, quantity: 1, discountBps: 0, note: 'Saturday evening hold' },
    ],
  }
}

/** Client view of the same cart: client prices only. */
export function sampleQuote(): QuoteView {
  const c = sampleCart('shared')
  const ctx = samplePlannerContext()
  const p = priceCart(c.lines.map((l) => ({ ...l })), { memberActive: true, memberDiscountBps: 5000, maxLineDiscountBps: ctx.limits.maxLineDiscountBps }, { deliveryFeeCents: c.deliveryFeeCents, taxRate: c.taxRate })
  return {
    id: c.id, title: c.title, status: 'shared', plannerName: 'Ava Laurent', eventDate: c.eventDate, noteToClient: c.noteToClient,
    lines: c.lines.map((l, i) => ({ id: l.id, name: l.name, clientUnitCents: p.lines[i].clientUnitCents, setupFeeCents: l.setupFeeCents, quantity: l.quantity, discountBps: p.lines[i].discountBps, note: l.note })),
    subtotalCents: p.subtotalCents, setupFeeCents: p.setupFeeCents, deliveryFeeCents: p.deliveryFeeCents, taxCents: p.taxCents, totalCents: p.totalCents,
    paidCents: 0, payments: [],
  }
}

export function sampleCartList(): CartSummary[] {
  return [
    { id: 'cart-demo', leadId: 'e1', eventTitle: 'Harper & Cole wedding', eventDate: '2026-11-14', clientName: 'Nora Harper', plannerName: 'Ava Laurent', title: 'Reception, 140 guests', status: 'approved', paidCents: status === 'approved' ? 284484 : 0, orderId: null, updatedAt: '2026-10-21T16:00:00Z', totalCents: 905966, marginCents: 211400 },
    { id: 'cart-3', leadId: 'e4', eventTitle: 'Bellweather rehearsal dinner', eventDate: '2026-09-19', clientName: 'Sam Bellweather', plannerName: 'Marco Reyes', title: 'Dinner tables', status: 'ordered', paidCents: 1210000, orderId: 'ord-demo', updatedAt: '2026-09-12T16:00:00Z', totalCents: 1210000, marginCents: 286000 },
  ]
}
