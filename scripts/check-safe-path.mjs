import assert from 'node:assert/strict'
import { safeInternalPath } from '../lib/security/safe-path.ts'
import { permissionForAdminPath } from '../lib/admin/route-access.ts'
import { userHasPermission } from '../lib/auth/permission-catalog.ts'
import { assertBootstrapEnv } from './bootstrap-super-admin.mjs'

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
assert.equal(permissionForAdminPath('/admin/team/shifts'), 'shifts.view')
assert.equal(permissionForAdminPath('/admin/settings/billing'), 'settings.view')
assert.equal(permissionForAdminPath('/admin/tasks'), 'orders.view')
assert.equal(permissionForAdminPath('/admin/appointments'), 'appointments.view')
assert.equal(permissionForAdminPath('/admin/portfolio'), 'portfolio.view')
assert.equal(permissionForAdminPath('/admin/portfolio/new'), 'portfolio.create')
assert.equal(permissionForAdminPath('/admin/visual-editor'), 'visual_editor.view')
assert.equal(permissionForAdminPath('/admin/marketing/discounts'), 'discounts.view')
assert.equal(permissionForAdminPath('/admin/delivery'), 'delivery.view')
assert.equal(permissionForAdminPath('/admin/categories'), 'catalog.view')

const staff = { roles: [{ name: 'staff' }], permissions: [{ name: 'orders.view' }] }
assert.equal(userHasPermission(staff, 'portal.access', { bridge: true }), true)
assert.equal(userHasPermission(staff, 'discounts.view', { bridge: true }), true)
assert.equal(userHasPermission(staff, 'users.manage', { bridge: true }), false)
assert.equal(userHasPermission(staff, 'discounts.view', { bridge: false }), false)
assert.equal(userHasPermission(
  { roles: [{ name: 'staff' }], permissions: [{ name: 'portal.access' }, { name: 'discounts.view' }] },
  'discounts.view',
  { bridge: false },
), true)

const manager = { roles: [{ name: 'manager' }], permissions: [{ name: 'orders.view' }] }
assert.equal(userHasPermission(manager, 'settings.manage', { bridge: true }), false)
assert.equal(userHasPermission(manager, 'appointments.view', { bridge: true }), true)
assert.equal(userHasPermission({ roles: [{ name: 'viewer' }], permissions: [] }, 'portal.access', { bridge: true }), false)
assert.equal(userHasPermission({ roles: [{ name: 'super_admin' }], permissions: [] }, 'settings.manage', { bridge: false }), true)
assert.equal(userHasPermission({ roles: [{ name: 'admin' }], permissions: [{ name: 'orders.view' }] }, 'settings.manage', { bridge: false }), false)
assert.equal(userHasPermission({ roles: [{ name: 'warehouse' }], permissions: [{ name: 'orders.manage' }] }, 'orders.delete', { bridge: false }), true)

assert.throws(() => assertBootstrapEnv({ SUPER_ADMIN_EMAIL: 'super@admin.com', SUPER_ADMIN_PASSWORD: 'replace-with-a-long-random-password' }))
assert.throws(() => assertBootstrapEnv({ SUPER_ADMIN_EMAIL: 'super@admin.com', SUPER_ADMIN_PASSWORD: 'short' }))
const bootstrap = assertBootstrapEnv({ SUPER_ADMIN_EMAIL: 'Super@Admin.com', SUPER_ADMIN_PASSWORD: 'a-real-temporary-password' })
assert.equal(bootstrap.email, 'super@admin.com')
assert.equal(bootstrap.password, 'a-real-temporary-password')

console.log('safe-path checks passed')
