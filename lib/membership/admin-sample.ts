import type { MembersDeskData } from './admin-types'

/** Mock data for /preview routes only. */
export function sampleMembersDesk(): MembersDeskData {
  return {
    limits: { memberDiscountBps: 5000, maxLineDiscountBps: 1500, defaultDepositBps: 3000 },
    members: [
      { id: 'p-ava', name: 'Ava Laurent', email: 'ava@example.com', status: 'active', periodEnd: '2026-11-18T00:00:00Z', terminatedReason: null, banned: false, eventCount: 4 },
      { id: 'p-marco', name: 'Marco Reyes', email: 'marco@example.com', status: 'past_due', periodEnd: '2026-10-20T00:00:00Z', terminatedReason: null, banned: false, eventCount: 2 },
      { id: 'p-june', name: 'June Okafor', email: 'june@example.com', status: 'terminated', periodEnd: null, terminatedReason: 'sharing', banned: true, eventCount: 0 },
      { id: 'p-sol', name: 'Sol Imani', email: 'sol@example.com', status: 'terminated', periodEnd: null, terminatedReason: 'nonpayment', banned: true, eventCount: 0 },
    ],
    categories: [
      { id: 'c1', name: 'Seating', rule: true }, { id: 'c2', name: 'Tables', rule: true }, { id: 'c3', name: 'Linens', rule: true }, { id: 'c4', name: 'Staging', rule: null },
    ],
    products: [
      { id: 'pr1', name: 'Gold Chiavari chair', categoryId: 'c1', categoryName: 'Seating', rule: null, effective: true },
      { id: 'pr2', name: 'Ghost chair', categoryId: 'c1', categoryName: 'Seating', rule: false, effective: false },
      { id: 'pr3', name: 'LED dance floor, 16×16', categoryId: 'c4', categoryName: 'Staging', rule: null, effective: false },
    ],
    leads: [{ id: 'e1', title: 'Nora Harper · Wedding', plannerId: 'p-ava' }, { id: 'e2', title: 'Meridian Partners · Gala', plannerId: null }],
  }
}
