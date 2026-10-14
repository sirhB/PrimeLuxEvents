import assert from 'node:assert/strict'
import { safeInternalPath } from '../lib/security/safe-path.ts'

assert.equal(safeInternalPath(null), '/account')
assert.equal(safeInternalPath('/admin/orders'), '/admin/orders')
assert.equal(safeInternalPath('//evil.example'), '/account')
assert.equal(safeInternalPath('https://evil.example'), '/account')
assert.equal(safeInternalPath('/\\evil.example'), '/account')
assert.equal(safeInternalPath('javascript:alert(1)'), '/account')
assert.equal(safeInternalPath('/login?next=/account'), '/login?next=/account')

console.log('safe-path checks passed')
