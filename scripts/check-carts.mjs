// Planner membership + cart pricing checks. Run: node --experimental-strip-types scripts/check-carts.mjs
import assert from 'node:assert/strict'
import { markupPct, memberCost, planPayments, priceCart, priceLine, splitEven } from '../lib/carts/pricing.ts'
import { allocateFees, feeRefundCents, paymentSplit, primeLuxFeeCents } from '../lib/carts/split.ts'
import { displayStatus, invoiceAllowed, priceInvoice } from '../lib/invoices/math.ts'
import { canSubscribe, isActiveMember, isEligible, nextMembershipState } from '../lib/membership/policy.ts'

let n = 0
const t = (name, fn) => { try { fn(); n++ } catch (e) { console.error(`FAIL: ${name}`); throw e } }
const member = { memberActive: true, memberDiscountBps: 5000, maxLineDiscountBps: 1500 }
const lapsed = { ...member, memberActive: false }

// --- Eligibility ---
t('eligibility: product rule beats category, default not eligible', () => {
  const map = { product: new Map([['p1', false], ['p2', true]]), category: new Map([['c1', true]]) }
  assert.equal(isEligible({ productId: 'p1', categoryId: 'c1' }, map), false)
  assert.equal(isEligible({ productId: 'p2', categoryId: 'cX' }, map), true)
  assert.equal(isEligible({ productId: 'p3', categoryId: 'c1' }, map), true)
  assert.equal(isEligible({ productId: 'p3', categoryId: 'c9' }, map), false)
  assert.equal(isEligible({}, map), false)
})

// --- Member discount ---
t('discount: 50% off eligible only while active', () => {
  assert.equal(memberCost(1250, true, member), 625)
  assert.equal(memberCost(1250, false, member), 1250)
  assert.equal(memberCost(1250, true, lapsed), 1250)
  assert.equal(memberCost(1251, true, member), 625) // 625.5 -> rounds discount to 626
})
t('discount: lapsed member pays list cost, margin shrinks', () => {
  const a = priceLine({ listUnitCents: 1000, quantity: 10, eligible: true }, member)
  const b = priceLine({ listUnitCents: 1000, quantity: 10, eligible: true }, lapsed)
  assert.equal(a.costCents, 5000); assert.equal(a.marginCents, 5000)
  assert.equal(b.costCents, 10000); assert.equal(b.marginCents, 0)
})

// --- No combining ---
t('no combining: line discount ignored on member-discounted lines', () => {
  const l = priceLine({ listUnitCents: 1000, quantity: 1, eligible: true, discountBps: 1000 }, member)
  assert.equal(l.memberDiscounted, true); assert.equal(l.discountBps, 0); assert.equal(l.discountBlocked, true)
  assert.equal(l.clientNetCents, 1000)
})
t('no combining: line discount allowed on non-eligible lines, capped by admin max', () => {
  const l = priceLine({ listUnitCents: 1000, quantity: 1, eligible: false, markupBps: 5000, discountBps: 9000 }, member)
  assert.equal(l.memberDiscounted, false)
  assert.equal(l.discountBps, 1500)
  assert.equal(l.clientNetCents, 1275)
})
t('line discount never goes below cost', () => {
  const l = priceLine({ listUnitCents: 1000, quantity: 1, eligible: false, markupBps: 500, discountBps: 1500 }, member)
  assert.ok(l.clientNetCents >= l.costCents); assert.ok(l.marginCents >= 0)
})

// --- Markup + margin ---
t('markup: default client price is list; planner keeps the member discount as margin', () => {
  const l = priceLine({ listUnitCents: 2000, quantity: 3, eligible: true }, member)
  assert.equal(l.costUnitCents, 1000); assert.equal(l.clientUnitCents, 2000); assert.equal(l.marginCents, 3000)
})
t('markup: percentage on cost', () => {
  const l = priceLine({ listUnitCents: 2000, quantity: 2, eligible: true, markupBps: 4000 }, member)
  assert.equal(l.clientUnitCents, 1400); assert.equal(l.marginCents, 800); assert.equal(markupPct(1000, 1400), 40)
})
t('markup: explicit client price wins, never below cost', () => {
  assert.equal(priceLine({ listUnitCents: 2000, quantity: 1, eligible: true, clientUnitCents: 1800, markupBps: 9000 }, member).clientUnitCents, 1800)
  assert.equal(priceLine({ listUnitCents: 2000, quantity: 1, eligible: true, clientUnitCents: 100 }, member).clientUnitCents, 1000)
})
t('markup: cart default markup applies to lines without their own', () => {
  const c = priceCart([{ listUnitCents: 1000, quantity: 1, eligible: true }], { ...member, defaultMarkupBps: 2000 })
  assert.equal(c.lines[0].clientUnitCents, 600)
})
t('cart totals: tax on client merchandise + setup, not delivery; margin = subtotal - cost', () => {
  const c = priceCart([
    { listUnitCents: 1250, setupFeeCents: 150, quantity: 100, eligible: true },
    { listUnitCents: 185000, quantity: 1, eligible: false, discountBps: 1000, markupBps: 2000 },
  ], member, { deliveryFeeCents: 12500, taxRate: 0.08875 })
  const l2 = priceLine({ listUnitCents: 185000, quantity: 1, eligible: false, discountBps: 1000, markupBps: 2000 }, member)
  assert.equal(c.subtotalCents, 125000 + l2.clientNetCents)
  assert.equal(c.setupFeeCents, 15000)
  assert.equal(c.taxCents, Math.round((c.subtotalCents + 15000) * 0.08875))
  assert.equal(c.totalCents, c.subtotalCents + 15000 + 12500 + c.taxCents)
  assert.equal(c.costCents, 62500 + 185000)
  assert.equal(c.marginCents, c.subtotalCents - c.costCents)
  assert.equal(c.memberSavingsCents, 62500)
})

// --- Splitter ---
t('split even sums exactly', () => {
  assert.deepEqual(splitEven(100001, 3), [33334, 33334, 33333])
  assert.deepEqual(splitEven(0, 3), [])
})
t('plan: full is one final payment', () => {
  const p = planPayments({ totalCents: 905966, mode: 'full' })
  assert.equal(p.payments.length, 1); assert.equal(p.payments[0].kind, 'final'); assert.equal(p.payments[0].amountCents, 905966)
})
t('plan: deposit then balance, minus paid', () => {
  const p = planPayments({ totalCents: 500000, paidCents: 100000, mode: 'deposit', depositBps: 3000 })
  assert.deepEqual(p.payments.map((x) => [x.kind, x.amountCents]), [['deposit', 120000], ['final', 280000]])
})
t('plan: installments sum exactly, last is final', () => {
  const p = planPayments({ totalCents: 300001, mode: 'installments', installments: 4 })
  assert.equal(p.payments.length, 4); assert.equal(p.payments.reduce((s, x) => s + x.amountCents, 0), 300001)
  assert.equal(p.payments.at(-1).kind, 'final')
})
t('plan: optional cap splits and warns', () => {
  const p = planPayments({ totalCents: 600000, mode: 'full', capCents: 250000 })
  assert.equal(p.payments.length, 3); assert.ok(p.payments.every((x) => x.amountCents <= 250000)); assert.equal(p.warnings.length, 1)
})
t('plan: nothing owed', () => {
  assert.equal(planPayments({ totalCents: 1000, paidCents: 1000, mode: 'full' }).payments.length, 0)
})

// --- Membership + bans ---
t('ban: banned planner can never subscribe', () => {
  assert.deepEqual(canSubscribe({ banned: true, status: 'canceled', acceptedPolicies: true }), { ok: false, reason: 'banned' })
  assert.deepEqual(canSubscribe({ banned: false, status: 'terminated', acceptedPolicies: true }), { ok: false, reason: 'banned' })
  assert.deepEqual(canSubscribe({ banned: false, status: 'active', acceptedPolicies: true }), { ok: false, reason: 'already_member' })
  assert.deepEqual(canSubscribe({ banned: false, status: 'none', acceptedPolicies: false }), { ok: false, reason: 'policies' })
  assert.deepEqual(canSubscribe({ banned: false, status: 'canceled', acceptedPolicies: true }), { ok: true })
})
t('state: paid -> active, failed -> past_due, retries exhausted -> terminated + ban', () => {
  assert.deepEqual(nextMembershipState('incomplete', { type: 'invoice.paid' }), { status: 'active', ban: null })
  assert.deepEqual(nextMembershipState('active', { type: 'invoice.payment_failed' }), { status: 'past_due', ban: null })
  assert.deepEqual(nextMembershipState('past_due', { type: 'invoice.paid' }), { status: 'active', ban: null })
  assert.deepEqual(nextMembershipState('past_due', { type: 'customer.subscription.updated', stripeStatus: 'unpaid' }), { status: 'terminated', ban: 'nonpayment' })
  assert.deepEqual(nextMembershipState('past_due', { type: 'customer.subscription.deleted', cancellationReason: 'payment_failed' }), { status: 'terminated', ban: 'nonpayment' })
})
t('state: voluntary cancel while paid up is not a ban', () => {
  assert.deepEqual(nextMembershipState('active', { type: 'customer.subscription.deleted', cancellationReason: 'cancellation_requested' }), { status: 'canceled', ban: null })
})
t('state: admin terminate for sharing bans; terminated is final', () => {
  assert.deepEqual(nextMembershipState('active', { type: 'admin.terminate' }), { status: 'terminated', ban: 'sharing' })
  assert.deepEqual(nextMembershipState('terminated', { type: 'invoice.paid' }), { status: 'terminated', ban: null })
  assert.equal(isActiveMember('active', true), false)
  assert.equal(isActiveMember('past_due'), false)
  assert.equal(isActiveMember('active'), true)
})

// --- Connect fee split ---
t('fee: rental cost + setup + delivery + tax on rentals; capped at total', () => {
  const c = priceCart([{ listUnitCents: 2000, setupFeeCents: 200, quantity: 10, eligible: true }], member, { deliveryFeeCents: 5000, taxRate: 0.1 })
  // cost 10000, setup 2000, delivery 5000, tax on (10000+2000) = 1200
  const fee = primeLuxFeeCents({ rentalCostCents: c.costCents, setupFeeCents: c.setupFeeCents, deliveryFeeCents: c.deliveryFeeCents, taxRate: 0.1, totalCents: c.totalCents })
  assert.equal(fee, 18200)
  // client total = 20000 + 2000 + 5000 + 2200 = 29200; planner keeps markup 10000 + its tax 1000
  assert.equal(c.totalCents - fee, 11000)
  assert.equal(primeLuxFeeCents({ rentalCostCents: 50000, setupFeeCents: 0, deliveryFeeCents: 0, taxRate: 0.1, totalCents: 40000 }), 40000)
})
t('fee: non-member pays list cost, so Prime Lux share is larger', () => {
  const a = priceCart([{ listUnitCents: 2000, quantity: 10, eligible: true }], member)
  const b = priceCart([{ listUnitCents: 2000, quantity: 10, eligible: true }], lapsed)
  assert.equal(primeLuxFeeCents({ rentalCostCents: a.costCents, setupFeeCents: 0, deliveryFeeCents: 0, taxRate: 0, totalCents: a.totalCents }), 10000)
  assert.equal(primeLuxFeeCents({ rentalCostCents: b.costCents, setupFeeCents: 0, deliveryFeeCents: 0, taxRate: 0, totalCents: b.totalCents }), 20000)
})
t('fee allocation across deposit + balance + installments sums exactly', () => {
  const total = 905966, fee = 401234
  const plan = planPayments({ totalCents: total, mode: 'installments', installments: 3 })
  const fees = allocateFees(plan.payments.map((p) => p.amountCents), fee, total)
  assert.equal(fees.reduce((a, b) => a + b, 0), fee)
  fees.forEach((f, i) => assert.ok(f <= plan.payments[i].amountCents))
})
t('fee allocation honors fees already charged on earlier payments', () => {
  const fees = allocateFees([70000], 50000, 100000, 15000, 30000)
  assert.deepEqual(fees, [35000])
})
t('refund: application fee refunded proportionally', () => {
  assert.equal(feeRefundCents(50000, 100000, 40000), 20000)
  assert.equal(feeRefundCents(100000, 100000, 40000), 40000)
  assert.equal(feeRefundCents(150000, 100000, 40000), 40000)
  assert.equal(feeRefundCents(0, 100000, 40000), 0)
  assert.equal(feeRefundCents(33333, 100000, 40001), 13334)
})
t('split: client paid, Prime Lux fee, planner net after Stripe fee and refunds', () => {
  assert.deepEqual(paymentSplit({ amountCents: 100000, applicationFeeCents: 40000, stripeFeeCents: 2930 }),
    { clientPaidCents: 100000, primeLuxFeeCents: 40000, stripeFeeCents: 2930, plannerNetCents: 57070 })
  assert.deepEqual(paymentSplit({ amountCents: 100000, applicationFeeCents: 40000, stripeFeeCents: 2930, refundedCents: 50000, feeRefundedCents: 20000 }),
    { clientPaidCents: 50000, primeLuxFeeCents: 20000, stripeFeeCents: 2930, plannerNetCents: 27070 })
  assert.equal(paymentSplit({ amountCents: 100, applicationFeeCents: 10, stripeFeeCents: null }).plannerNetCents, null)
})

// --- Invoicing ---
t('invoice fee: mixed catalog + custom; fee covers catalog only', () => {
  const cat = [{ listUnitCents: 2000, setupFeeCents: 200, quantity: 10, eligible: true, markupBps: 10000 }]
  const custom = [{ unitCents: 250000, quantity: 1, taxable: false }, { unitCents: 10000, quantity: 3, taxable: true }]
  const p = priceInvoice(cat, custom, member, { deliveryFeeCents: 5000, taxRate: 0.1 })
  // catalog: cost 10000, client 20000, setup 2000, delivery 5000, tax 2200 -> 29200; fee 18200
  assert.equal(p.primeLuxFeeCents, 18200)
  assert.equal(p.customSubtotalCents, 280000)
  assert.equal(p.taxCents, 2200 + 3000)
  assert.equal(p.totalCents, 29200 + 280000 + 3000)
  assert.equal(p.plannerGrossCents, p.totalCents - 18200)
  // Fee is identical to the same catalog lines invoiced alone.
  assert.equal(priceInvoice(cat, [], member, { deliveryFeeCents: 5000, taxRate: 0.1 }).primeLuxFeeCents, 18200)
})
t('invoice fee: custom-only invoice carries no Prime Lux fee or delivery', () => {
  const p = priceInvoice([], [{ unitCents: 150000, quantity: 1, taxable: true }], member, { deliveryFeeCents: 5000, taxRate: 0.1 })
  assert.equal(p.primeLuxFeeCents, 0)
  assert.equal(p.deliveryFeeCents, 0)
  assert.equal(p.totalCents, 165000)
})
t('invoice fee: installments split the catalog fee exactly', () => {
  const p = priceInvoice([{ listUnitCents: 33333, quantity: 7, eligible: true, markupBps: 3000 }], [{ unitCents: 99999, quantity: 1, taxable: false }], member, { taxRate: 0.08875 })
  const plan = planPayments({ totalCents: p.totalCents, mode: 'deposit', depositBps: 2500 })
  const fees = allocateFees(plan.payments.map((x) => x.amountCents), p.primeLuxFeeCents, p.totalCents)
  assert.equal(fees.reduce((a, b) => a + b, 0), p.primeLuxFeeCents)
})
t('invoice gating: only active, unbanned members create/edit/send', () => {
  for (const a of ['create', 'edit', 'send']) {
    assert.equal(invoiceAllowed(a, { status: 'active', banned: false }), true)
    for (const st of ['none', 'incomplete', 'past_due', 'canceled', 'terminated']) assert.equal(invoiceAllowed(a, { status: st, banned: false }), false, `${a}/${st}`)
    assert.equal(invoiceAllowed(a, { status: 'active', banned: true }), false)
  }
})
t('invoice gating: open invoices stay payable after membership ends', () => {
  for (const st of ['canceled', 'terminated', 'past_due']) {
    assert.equal(invoiceAllowed('pay', { status: st, banned: true }), true)
    assert.equal(invoiceAllowed('view', { status: st, banned: false }), true)
  }
})
t('invoice status: overdue is open past due date', () => {
  assert.equal(displayStatus('open', '2026-10-01', '2026-10-22'), 'overdue')
  assert.equal(displayStatus('open', '2026-10-30', '2026-10-22'), 'open')
  assert.equal(displayStatus('paid', '2026-10-01', '2026-10-22'), 'paid')
  assert.equal(displayStatus('draft', null, '2026-10-22'), 'draft')
})

console.log(`check-carts: ${n} checks passed`)
