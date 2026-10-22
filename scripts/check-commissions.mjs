// Commission math checks. Run: node --experimental-strip-types scripts/check-commissions.mjs
import assert from 'node:assert/strict'
import {
  commissionCents, computeTarget, ledgerDelta, resolveRateBps, resolveTrigger, summarize, transferableCents,
} from '../lib/commissions/calc.ts'
import { signWebhook, verifyWebhook } from '../lib/whop/webhook.ts'

let n = 0
const t = (name, fn) => { fn(); n++; }
const pay = (kind, amountCents, extra = {}) => ({ kind, amountCents, refundedCents: 0, disputeStatus: 'none', ...extra })
const rates = { defaultRateBps: 1000 }
const finalRule = { defaultTrigger: 'final_payment' }
const depositRule = { defaultTrigger: 'deposit' }

t('rate precedence', () => {
  assert.equal(resolveRateBps({ defaultRateBps: 1000 }), 1000)
  assert.equal(resolveRateBps({ defaultRateBps: 1000, plannerRateBps: 1500 }), 1500)
  assert.equal(resolveRateBps({ defaultRateBps: 1000, plannerRateBps: 1500, eventRateBps: 0 }), 0)
  assert.equal(resolveRateBps({ defaultRateBps: 1000, eventRateBps: 20000 }), 10000)
})
t('trigger precedence', () => {
  assert.equal(resolveTrigger({ defaultTrigger: 'final_payment', plannerTrigger: 'deposit' }), 'deposit')
  assert.equal(resolveTrigger({ defaultTrigger: 'deposit', plannerTrigger: 'deposit', eventTrigger: 'final_payment' }), 'final_payment')
})
t('rounding half-up', () => {
  assert.equal(commissionCents(12345, 1000), 1235) // 1234.5 -> 1235
  assert.equal(commissionCents(12344, 1000), 1234)
  assert.equal(commissionCents(0, 1000), 0)
  assert.equal(commissionCents(-500, 1000), 0)
})
t('final-payment rule: pending after deposit only', () => {
  const r = computeTarget([pay('deposit', 200000)], rates, finalRule)
  assert.equal(r.state, 'pending'); assert.equal(r.targetCents, 0); assert.equal(r.basisCents, 200000)
})
t('final-payment rule: earned on all money once final clears', () => {
  const r = computeTarget([pay('deposit', 200000), pay('final', 800000)], rates, finalRule)
  assert.equal(r.state, 'earned'); assert.equal(r.targetCents, 100000)
})
t('deposit rule: earned on deposit, grows with later payments', () => {
  const a = computeTarget([pay('deposit', 200000)], rates, depositRule)
  assert.equal(a.state, 'earned'); assert.equal(a.targetCents, 20000)
  assert.deepEqual(ledgerDelta(a, 0), { kind: 'accrual', amountCents: 20000 })
  const b = computeTarget([pay('deposit', 200000), pay('final', 800000)], rates, depositRule)
  assert.deepEqual(ledgerDelta(b, 20000), { kind: 'accrual', amountCents: 80000 })
})
t('partial refund reverses proportionally', () => {
  const r = computeTarget([pay('deposit', 200000), pay('final', 800000, { refundedCents: 300000 })], rates, finalRule)
  assert.equal(r.targetCents, 70000)
  assert.deepEqual(ledgerDelta(r, 100000), { kind: 'reversal', amountCents: -30000 })
})
t('fully refunded final payment drops back to pending and reverses everything', () => {
  const r = computeTarget([pay('deposit', 200000), pay('final', 800000, { refundedCents: 800000 })], rates, finalRule)
  assert.equal(r.state, 'pending')
  assert.deepEqual(ledgerDelta(r, 100000), { kind: 'reversal', amountCents: -100000 })
})
t('open chargeback holds and books nothing', () => {
  const r = computeTarget([pay('deposit', 200000), pay('final', 800000, { disputeStatus: 'open' })], rates, finalRule)
  assert.equal(r.state, 'held')
  assert.deepEqual(ledgerDelta(r, 100000), { kind: 'none' })
})
t('lost chargeback reverses, won chargeback restores', () => {
  const lost = computeTarget([pay('deposit', 200000), pay('final', 800000, { disputeStatus: 'lost' })], rates, finalRule)
  assert.deepEqual(ledgerDelta(lost, 100000), { kind: 'reversal', amountCents: -100000 })
  const won = computeTarget([pay('deposit', 200000), pay('final', 800000, { disputeStatus: 'won' })], rates, finalRule)
  assert.deepEqual(ledgerDelta(won, 100000), { kind: 'none' })
})
t('idempotent: same facts twice book nothing new', () => {
  const r = computeTarget([pay('deposit', 200000), pay('final', 800000)], rates, finalRule)
  assert.deepEqual(ledgerDelta(r, r.targetCents), { kind: 'none' })
})
t('summary + transferable net reversals against unpaid earnings', () => {
  const rows = [
    { plannerId: 'p', leadId: 'a', amountCents: 100000, status: 'paid' },
    { plannerId: 'p', leadId: 'a', amountCents: -30000, status: 'earned' },
    { plannerId: 'p', leadId: 'b', amountCents: 50000, status: 'earned' },
    { plannerId: 'p', leadId: 'c', amountCents: 0, status: 'pending' },
  ]
  const s = summarize(rows)
  assert.equal(s.paidCents, 100000); assert.equal(s.earnedCents, 20000); assert.equal(s.owedBackCents, 0)
  assert.equal(transferableCents(rows), 20000)
  const owing = summarize([{ plannerId: 'p', leadId: 'a', amountCents: -30000, status: 'earned' }])
  assert.equal(owing.owedBackCents, 30000); assert.equal(owing.earnedCents, 0)
  assert.equal(transferableCents([{ plannerId: 'p', leadId: 'a', amountCents: -30000, status: 'earned' }]), 0)
})

t('webhook signature: valid, tampered, stale, multi-sig', () => {
  const secret = 'ws_test_not_a_real_secret'
  const body = '{"type":"payment.succeeded"}'
  const now = 1_800_000_000
  const sig = signWebhook(secret, 'msg_1', String(now), body)
  verifyWebhook(body, { id: 'msg_1', timestamp: String(now), signature: `v1,${sig}` }, secret, now)
  verifyWebhook(body, { id: 'msg_1', timestamp: String(now), signature: `v1,AAAA v1,${sig}` }, secret, now)
  assert.throws(() => verifyWebhook(body + ' ', { id: 'msg_1', timestamp: String(now), signature: `v1,${sig}` }, secret, now))
  assert.throws(() => verifyWebhook(body, { id: 'msg_2', timestamp: String(now), signature: `v1,${sig}` }, secret, now))
  assert.throws(() => verifyWebhook(body, { id: 'msg_1', timestamp: String(now), signature: `v1,${sig}` }, secret, now + 301))
  assert.throws(() => verifyWebhook(body, { id: 'msg_1', timestamp: String(now), signature: `v1,${sig}` }, '', now))
})

console.log(`check-commissions: ${n} checks passed`)
