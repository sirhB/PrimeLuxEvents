/**
 * Server-side route permissions. Longest prefix wins.
 * `null` means any active staff role (admin, manager, staff) may open the path.
 * A string is a permission name; admin and `resource.manage` satisfy it.
 */
export type AdminRouteRule = {
  prefix: string
  permission: string | null
}

export const ADMIN_ROUTE_RULES: AdminRouteRule[] = [
  { prefix: '/admin/orders/new', permission: 'orders.create' },
  { prefix: '/admin/orders', permission: 'orders.view' },
  { prefix: '/admin/products/new', permission: 'products.create' },
  { prefix: '/admin/products/verify', permission: 'products.update' },
  { prefix: '/admin/products', permission: 'products.view' },
  { prefix: '/admin/categories', permission: 'products.view' },
  { prefix: '/admin/packages', permission: 'products.view' },
  { prefix: '/admin/consultations', permission: 'consultations.view' },
  { prefix: '/admin/customers', permission: 'customers.view' },
  { prefix: '/admin/messages', permission: 'customers.view' },
  { prefix: '/admin/partners', permission: 'customers.view' },
  { prefix: '/admin/team/shifts', permission: null },
  { prefix: '/admin/team', permission: 'users.view' },
  { prefix: '/admin/settings', permission: 'settings.view' },
  { prefix: '/admin/api-keys', permission: 'settings.view' },
  { prefix: '/admin/activity', permission: 'settings.view' },
  { prefix: '/admin/analytics', permission: 'reports.view' },
  { prefix: '/admin/week-prep', permission: 'orders.view' },
  { prefix: '/admin/calendar', permission: 'orders.view' },
  { prefix: '/admin/warehouse', permission: 'orders.view' },
  { prefix: '/admin/scan', permission: 'orders.view' },
  { prefix: '/admin/pack-slip', permission: 'orders.view' },
  { prefix: '/admin/delivery', permission: 'orders.view' },
  { prefix: '/admin/bags', permission: 'orders.view' },
  { prefix: '/admin/inventory', permission: 'orders.view' },
  { prefix: '/admin/tasks', permission: 'orders.view' },
  { prefix: '/admin/logistics', permission: 'orders.view' },
]

export function permissionForAdminPath(pathname: string): string | null {
  const path = pathname.split('?')[0].replace(/\/+$/, '') || '/'
  let match: AdminRouteRule | null = null
  for (const rule of ADMIN_ROUTE_RULES) {
    const hit = path === rule.prefix || path.startsWith(`${rule.prefix}/`)
    if (!hit) continue
    if (!match || rule.prefix.length > match.prefix.length) match = rule
  }
  return match?.permission ?? null
}
