/**
 * Server-side route permissions. Longest prefix wins.
 * `null` means any user who can open the staff portal may view the path.
 * Permission names come from lib/auth/permission-catalog.ts.
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
  { prefix: '/admin/categories/new', permission: 'catalog.create' },
  { prefix: '/admin/categories', permission: 'catalog.view' },
  { prefix: '/admin/packages/new', permission: 'catalog.create' },
  { prefix: '/admin/packages', permission: 'catalog.view' },
  { prefix: '/admin/consultations', permission: 'consultations.view' },
  { prefix: '/admin/venue', permission: 'crm.view' },
  { prefix: '/admin/my-tasks', permission: 'tasks.view' },
  { prefix: '/admin/staff-tasks', permission: 'tasks.view' },
  { prefix: '/admin/task-templates', permission: 'tasks.manage' },
  { prefix: '/admin/event-plans', permission: 'consultations.view' },
  { prefix: '/admin/customers', permission: 'customers.view' },
  { prefix: '/admin/messages', permission: 'customers.view' },
  { prefix: '/admin/partners', permission: 'customers.view' },
  { prefix: '/admin/team/shifts', permission: 'shifts.view' },
  { prefix: '/admin/team', permission: 'users.view' },
  { prefix: '/admin/settings', permission: 'settings.view' },
  { prefix: '/admin/bot-control', permission: 'bot.view' },
  { prefix: '/admin/bot-inbox', permission: 'bot_inbox.view' },
  { prefix: '/admin/api-keys', permission: 'settings.view' },
  { prefix: '/admin/activity', permission: 'settings.view' },
  { prefix: '/admin/commissions', permission: 'reports.view' },
  { prefix: '/admin/analytics', permission: 'reports.view' },
  { prefix: '/admin/week-prep', permission: 'orders.view' },
  { prefix: '/admin/calendar', permission: 'orders.view' },
  { prefix: '/admin/warehouse', permission: 'orders.view' },
  { prefix: '/admin/scan', permission: 'orders.view' },
  { prefix: '/admin/pack-slip', permission: 'orders.view' },
  { prefix: '/admin/delivery', permission: 'delivery.view' },
  { prefix: '/admin/bags', permission: 'orders.view' },
  { prefix: '/admin/inventory', permission: 'orders.view' },
  { prefix: '/admin/tasks', permission: 'orders.view' },
  { prefix: '/admin/logistics', permission: 'orders.view' },
  { prefix: '/admin/appointments', permission: 'appointments.view' },
  { prefix: '/admin/portfolio/new', permission: 'portfolio.create' },
  { prefix: '/admin/portfolio', permission: 'portfolio.view' },
  { prefix: '/admin/visual-editor', permission: 'visual_editor.view' },
  { prefix: '/admin/content', permission: 'content.view' },
  { prefix: '/admin/marketing/discounts', permission: 'discounts.view' },
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
