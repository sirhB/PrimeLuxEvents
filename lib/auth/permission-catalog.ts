/**
 * Single source of truth for permission names and default role grants.
 * Server checks, the admin nav, and the roles migration all follow this catalog.
 * The only role bypass is super_admin, which always has full access.
 */

export const SUPER_ADMIN_ROLE = 'super_admin'
export const PORTAL_ACCESS = 'portal.access'

export type PermissionAction = 'access' | 'view' | 'create' | 'update' | 'delete' | 'manage'

export type PermissionArea = {
  resource: string
  label: string
  description: string
  actions: PermissionAction[]
}

export type CatalogPermission = {
  name: string
  displayName: string
  description: string
  resource: string
  action: PermissionAction
}

/** Areas a super admin can toggle. Order is the order shown in Roles & Permissions. */
export const PERMISSION_AREAS: PermissionArea[] = [
  { resource: 'portal', label: 'Staff portal', description: 'Open the admin panel', actions: ['access'] },
  { resource: 'appointments', label: 'Appointments', description: 'Showroom visits and appointment records', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'portfolio', label: 'Portfolio', description: 'Gallery stories and portfolio entries', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'visual_editor', label: 'Visual editor', description: 'On-site visual editor', actions: ['view', 'update', 'manage'] },
  { resource: 'discounts', label: 'Discounts', description: 'Promo codes and tiered discounts', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'innovate', label: 'Innovate', description: 'Innovate studios', actions: ['view', 'manage'] },
  { resource: 'orders', label: 'Orders', description: 'Bookings and order changes', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'products', label: 'Products', description: 'Rental products', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'delivery', label: 'Delivery', description: 'Routes and drop-offs', actions: ['view', 'update', 'manage'] },
  { resource: 'invoices', label: 'Invoices', description: 'Invoices and rental agreements', actions: ['view', 'create', 'update', 'manage'] },
  { resource: 'shifts', label: 'Staff shifts', description: 'Shift roster', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'catalog', label: 'Catalog', description: 'Categories, packages, and catalog health', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'settings', label: 'Settings', description: 'Company settings, activity, and API keys', actions: ['view', 'update', 'manage'] },
  { resource: 'events', label: 'Events', description: 'Event records', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'customers', label: 'Customers', description: 'Clients, messages, and partners', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'consultations', label: 'Consultations', description: 'Leads and consultations', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'venues', label: 'Venues', description: 'Venue listings and the venue desk', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'crm', label: 'Venue CRM', description: 'Contacts, pipeline, proposals, contracts, and reports', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'content', label: 'Content', description: 'CMS content', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'users', label: 'Team', description: 'Members, roles, and invitations', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'reports', label: 'Reports', description: 'Analytics and reports', actions: ['view', 'create', 'manage'] },
  { resource: 'tasks', label: 'Tasks', description: 'Operational tasks', actions: ['view', 'create', 'update', 'delete', 'manage'] },
  { resource: 'bot', label: 'Bot control', description: 'Copy setup prompts for the external operations assistant', actions: ['view', 'manage'] },
]

const ACTION_LABEL: Record<PermissionAction, string> = {
  access: 'Access',
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  manage: 'Manage',
}

export const CATALOG_PERMISSIONS: CatalogPermission[] = PERMISSION_AREAS.flatMap((area) =>
  area.actions.map((action) => ({
    name: `${area.resource}.${action}`,
    displayName: `${ACTION_LABEL[action]} ${area.label}`,
    description: area.description,
    resource: area.resource,
    action,
  })),
)

const ALL_NAMES = CATALOG_PERMISSIONS.map((permission) => permission.name)
const ALL_SET = new Set(ALL_NAMES)

/**
 * Permissions introduced when the two role seeds were merged.
 * Their presence on a user means the catalog migration has been applied for them.
 * The bridge itself keys off permission_catalog_ready(), not this set.
 */
export const NEW_CATALOG_RESOURCES = new Set([
  'portal',
  'portfolio',
  'visual_editor',
  'discounts',
  'innovate',
  'delivery',
  'invoices',
  'shifts',
  'catalog',
])

const MANAGER_DENIED = new Set(['users.delete', 'users.manage', 'settings.manage'])

/** Operational access staff already have, plus the pages that were open to every staff role. */
const STAFF_GRANTS = [
  'portal.access',
  'events.view', 'events.create', 'events.update',
  'orders.view', 'orders.create', 'orders.update',
  'products.view', 'products.create', 'products.update',
  'customers.view', 'customers.create', 'customers.update',
  'consultations.view', 'consultations.create', 'consultations.update',
  'venues.view', 'venues.create', 'venues.update',
  'crm.view', 'crm.create', 'crm.update',
  'tasks.view', 'tasks.create', 'tasks.update',
  'appointments.view', 'appointments.create', 'appointments.update',
  'content.view', 'content.update',
  'reports.view',
  'portfolio.view', 'portfolio.create', 'portfolio.update',
  'visual_editor.view', 'visual_editor.update',
  'discounts.view', 'discounts.create', 'discounts.update',
  'innovate.view',
  'shifts.view', 'shifts.create', 'shifts.update', 'shifts.delete',
  'catalog.view', 'catalog.create', 'catalog.update',
  'delivery.view', 'delivery.update',
  'invoices.view', 'invoices.create', 'invoices.update',
]

const VIEWER_RESOURCES = [
  'events', 'orders', 'products', 'customers', 'consultations', 'venues', 'crm',
  'appointments', 'content', 'settings', 'users', 'reports', 'tasks',
]

const COORDINATOR_RESOURCES = ['events', 'consultations', 'customers', 'orders', 'venues', 'crm', 'tasks']

function namesFor(resources: string[], actions: PermissionAction[]): string[] {
  const allowed = new Set(actions)
  return ALL_NAMES.filter((name) => {
    const [resource, action] = name.split('.')
    return resources.includes(resource) && allowed.has(action as PermissionAction)
  })
}

const ROLE_GRANTS: Record<string, ReadonlySet<string>> = {
  super_admin: ALL_SET,
  admin: ALL_SET,
  manager: new Set(ALL_NAMES.filter((name) => !MANAGER_DENIED.has(name))),
  staff: new Set(STAFF_GRANTS),
  viewer: new Set(namesFor(VIEWER_RESOURCES, ['view'])),
  coordinator: new Set(namesFor(COORDINATOR_RESOURCES, ['view', 'create', 'update'])),
  driver: new Set(['tasks.view', 'tasks.update', 'orders.view']),
  warehouse: new Set(['products.view', 'products.update', 'orders.view', 'orders.update']),
}

export function grantsForRole(roleName: string): ReadonlySet<string> {
  return ROLE_GRANTS[roleName] ?? new Set()
}

export type PermissionSubject = {
  roles: Array<{ name: string }>
  permissions: Array<{ name: string }>
}

export function isSuperAdmin(subject: PermissionSubject): boolean {
  return subject.roles.some((role) => role.name === SUPER_ADMIN_ROLE)
}

function roleGrantsPermission(roleName: string, permissionName: string): boolean {
  const grants = grantsForRole(roleName)
  if (grants.has(permissionName)) return true
  const resource = permissionName.split('.')[0]
  return Boolean(resource && grants.has(`${resource}.manage`))
}

/**
 * @param bridge When true, the canonical catalog is not installed yet. Role defaults
 * fill any grant the database rows do not already contain, so existing managers and
 * staff keep the access they have today. Once portal.access exists, pass false.
 */
export function userHasPermission(
  subject: PermissionSubject,
  permissionName: string,
  options?: { bridge?: boolean },
): boolean {
  if (isSuperAdmin(subject)) return true

  const names = new Set(subject.permissions.map((permission) => permission.name))
  if (names.has(permissionName)) return true

  const resource = permissionName.split('.')[0]
  if (resource && names.has(`${resource}.manage`)) return true

  if (!options?.bridge) return false

  return subject.roles.some((role) => roleGrantsPermission(role.name, permissionName))
}
