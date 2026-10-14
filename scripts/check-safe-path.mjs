import assert from 'node:assert/strict'
import { safeInternalPath } from '../lib/security/safe-path.ts'
import { permissionForAdminPath } from '../lib/admin/route-access.ts'

assert.equal(safeInternalPath(null), '/account')
assert.equal(safeInternalPath('/admin/orders'), '/admin/orders')
assert.equal(safeInternalPath('//evil.example'), '/account')
assert.equal(safeInternalPath('https://evil.example'), '/account')
assert.equal(safeInternalPath('/\\evil.example'), '/account')
assert.equal(safeInternalPath('javascript:alert(1)'), '/account')
assert.equal(safeInternalPath('/login?next=/account'), '/login?next=/account')

assert.equal(permissionForAdminPath('/admin'), null)
assert.equal(permissionForAdminPath('/admin/orders'), 'orders.view')
assert.equal(permissionForAdminPath('/admin/orders/new'), 'orders.create')
assert.equal(permissionForAdminPath('/admin/orders/abc'), 'orders.view')
assert.equal(permissionForAdminPath('/admin/team'), 'users.view')
assert.equal(permissionForAdminPath('/admin/team/shifts'), null)
assert.equal(permissionForAdminPath('/admin/settings/billing'), 'settings.view')
assert.equal(permissionForAdminPath('/admin/tasks'), 'orders.view')
assert.equal(permissionForAdminPath('/admin/appointments'), null)

console.log('safe-path checks passed')
