import assert from 'node:assert/strict'
import { planRefund, stripeReason, validIdempotencyKey } from '../lib/orders/refund.ts'
import { parseAbandonDays, DEFAULT_ABANDON_DAYS } from '../lib/venues/abandon.ts'

// Refund planning
assert.deepEqual(planRefund(10_000, 0), { ok: true, amount: 10_000, full: true, remainingAfter: 0 })
assert.deepEqual(planRefund(10_000, 2_500, 2_500), { ok: true, amount: 2_500, full: false, remainingAfter: 5_000 })
assert.deepEqual(planRefund(10_000, 2_500, 7_500), { ok: true, amount: 7_500, full: true, remainingAfter: 0 })
assert.equal(planRefund(10_000, 2_500, 7_501).ok, false)
assert.equal(planRefund(10_000, 10_000).ok, false)
assert.equal(planRefund(10_000, 0, 0).ok, false)
assert.equal(planRefund(10_000, 0, -5).ok, false)
assert.equal(planRefund(10_000, 0, Number.NaN).ok, false)
assert.equal(stripeReason('duplicate'), 'duplicate')
assert.equal(stripeReason('other'), undefined)
assert.equal(validIdempotencyKey('a'.repeat(32)), true)
assert.equal(validIdempotencyKey('short'), false)
assert.equal(validIdempotencyKey('bad key with spaces!!'), false)

// Abandoned-cart setting
assert.equal(DEFAULT_ABANDON_DAYS, 3)
assert.equal(parseAbandonDays('5'), 5)
assert.equal(parseAbandonDays(null), 3)
assert.equal(parseAbandonDays('0'), 3)
assert.equal(parseAbandonDays('abc'), 3)
assert.equal(parseAbandonDays('61'), 3)

console.log('admin gaps checks passed')
