import { priceInvoice } from './math'
import type { ClientView, InvoiceContext, InvoiceSummary, InvoiceView, PublicInvoice } from './types'

/** Mock data for /preview routes only. No real people or money. */
export function sampleInvoiceContext(): InvoiceContext {
  return {
    memberStatus: 'active', canInvoice: true, connectReady: true, memberActive: true, memberDiscountBps: 5000, maxLineDiscountBps: 1500,
    catalog: [
      { productId: 'pr-chiavari', name: 'Gold Chiavari chair', category: 'Seating', listUnitCents: 1250, setupFeeCents: 150, eligible: true },
      { productId: 'pr-farm', name: 'Farmhouse table, 8 ft', category: 'Tables', listUnitCents: 9500, setupFeeCents: 1500, eligible: true },
      { productId: 'pr-dance', name: 'LED dance floor, 16×16', category: 'Staging', listUnitCents: 120000, setupFeeCents: 25000, eligible: false },
    ],
    clients: [{ id: 'c1', name: 'Nora Harper', email: 'nora@example.com' }],
  }
}

const LINES: InvoiceView['lines'] = [
  { id: 'l1', kind: 'catalog', productId: 'pr-chiavari', name: 'Gold Chiavari chair', description: '', quantity: 140, listUnitCents: 1250, setupFeeCents: 150, eligible: true, markupBps: 6000, unitCents: 1000, taxable: true },
  { id: 'l2', kind: 'catalog', productId: 'pr-farm', name: 'Farmhouse table, 8 ft', description: '', quantity: 14, listUnitCents: 9500, setupFeeCents: 1500, eligible: true, markupBps: 5000, unitCents: 7125, taxable: true },
  { id: 'l3', kind: 'custom', productId: null, name: 'Full-service planning', description: 'Timeline, vendor management, day-of lead', quantity: 1, listUnitCents: 0, setupFeeCents: 0, eligible: false, markupBps: null, unitCents: 450000, taxable: false },
  { id: 'l4', kind: 'custom', productId: null, name: 'Florals (Wild Stem Studio)', description: '', quantity: 1, listUnitCents: 0, setupFeeCents: 0, eligible: false, markupBps: null, unitCents: 280000, taxable: true },
]

function priced() {
  return priceInvoice(
    LINES.filter((l) => l.kind === 'catalog').map((l) => ({ listUnitCents: l.listUnitCents, setupFeeCents: l.setupFeeCents, quantity: l.quantity, eligible: l.eligible, markupBps: l.markupBps })),
    LINES.filter((l) => l.kind === 'custom').map((l) => ({ unitCents: l.unitCents, quantity: l.quantity, taxable: l.taxable })),
    { memberActive: true, memberDiscountBps: 5000, maxLineDiscountBps: 1500 }, { deliveryFeeCents: 12500, taxRate: 0.08875 },
  )
}

export function sampleInvoice(): InvoiceView {
  const p = priced()
  return {
    id: 'inv-demo', plannerName: 'Laurent Events', client: { id: 'c1', name: 'Nora Harper', email: 'nora@example.com' }, cartId: null,
    title: 'Harper & Cole wedding', memo: 'Thank you! Deposit holds your date; balance due two weeks before the event.', status: 'draft', display: 'draft',
    planMode: 'deposit', depositBps: 3000, installments: null, dueDate: '2026-11-05', deliveryFeeCents: 12500, taxRate: 0.08875,
    totalCents: p.totalCents, primeLuxFeeCents: p.primeLuxFeeCents, paidCents: 0, payUrl: null, lines: LINES, payments: [],
  }
}

export function sampleInvoiceList(): InvoiceSummary[] {
  const t = priced().totalCents
  return [
    { id: 'i1', title: 'Harper & Cole wedding', status: 'draft', display: 'draft', dueDate: '2026-11-05', totalCents: t, paidCents: 0, primeLuxFeeCents: 0, clientName: 'Nora Harper', plannerName: 'Laurent Events', createdAt: '2026-10-21' },
    { id: 'i2', title: 'Brightline offsite, day 1', status: 'open', display: 'overdue', dueDate: '2026-10-15', totalCents: 684000, paidCents: 205200, primeLuxFeeCents: 0, clientName: 'Brightline Labs', plannerName: 'Laurent Events', createdAt: '2026-09-30' },
    { id: 'i3', title: 'Okafor 40th', status: 'open', display: 'open', dueDate: '2026-11-12', totalCents: 312500, paidCents: 0, primeLuxFeeCents: 0, clientName: 'Ada Okafor', plannerName: 'Laurent Events', createdAt: '2026-10-18' },
    { id: 'i4', title: 'Planning retainer', status: 'paid', display: 'paid', dueDate: '2026-10-01', totalCents: 150000, paidCents: 150000, primeLuxFeeCents: 0, clientName: 'Mei & Jordan', plannerName: 'Laurent Events', createdAt: '2026-09-20' },
  ]
}

export function sampleClients(): ClientView[] {
  return [
    { id: 'c1', name: 'Nora Harper', email: 'nora@example.com', phone: null, company: null, invoiceCount: 1, openCents: 0 },
    { id: 'c2', name: 'Brightline Labs', email: 'events@example.com', phone: null, company: 'Brightline', invoiceCount: 1, openCents: 478800 },
    { id: 'c3', name: 'Ada Okafor', email: 'ada@example.com', phone: null, company: null, invoiceCount: 1, openCents: 312500 },
  ]
}

export function samplePublicInvoice(): PublicInvoice {
  const p = priced()
  const dep = Math.round(p.totalCents * 0.3)
  return {
    id: 'inv-demo', title: 'Harper & Cole wedding', memo: 'Thank you! Deposit holds your date; balance due two weeks before the event.', status: 'open', dueDate: '2026-11-05',
    businessName: 'Laurent Events', clientName: 'Nora Harper',
    lines: LINES.map((l) => ({ name: l.name, description: l.description || null, quantity: l.quantity, unitCents: l.unitCents })),
    setupFeeCents: p.catalogSetupCents, deliveryFeeCents: p.deliveryFeeCents, taxCents: p.taxCents, totalCents: p.totalCents, paidCents: 0,
    payments: [
      { label: 'Deposit (30%)', amountCents: dep, dueDate: '2026-11-05', status: 'open', number: 'LE-0012', url: '#', pdf: '#' },
      { label: 'Balance', amountCents: p.totalCents - dep, dueDate: '2026-12-05', status: 'open', number: 'LE-0013', url: '#', pdf: '#' },
    ],
  }
}
