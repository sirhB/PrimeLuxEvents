import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ClipboardCheck,
  TrendingUp,
  Activity,
  ShoppingCart,
  FileText,
  CalendarCheck,
  MessageSquare,
  Users,
  Tag,
  Truck,
  CalendarDays,
  Box,
  QrCode,
  Archive,
  MapPin,
  Briefcase,
  CheckSquare,
  Calendar,
  Package,
  Layers,
  ClipboardList,
  Image as ImageIcon,
  PenLine,
  UserCog,
  Settings,
  FileOutput,
  Plus,
  Handshake,
  Sparkles,
} from 'lucide-react'

export type AdminNavItem = {
  icon: LucideIcon
  label: string
  href: string
  /** Optional permission resource.action — hide when missing */
  permission?: string
  keywords?: string[]
}

export type AdminNavGroup = {
  title: string
  items: AdminNavItem[]
  /** When true, group starts collapsed unless a child route is active */
  defaultCollapsed?: boolean
}

/** Canonical admin information architecture */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: 'Today',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Ops home',
        href: '/admin',
        keywords: ['home', 'overview', 'dashboard', 'today'],
      },
      {
        icon: ClipboardCheck,
        label: 'Week Prep',
        href: '/admin/week-prep',
        keywords: ['weekend', 'prep', 'readiness', 'fulfillment'],
      },
      { icon: Calendar, label: 'Calendar', href: '/admin/calendar', keywords: ['schedule'] },
      { icon: Activity, label: 'Activity', href: '/admin/activity', keywords: ['feed', 'audit'] },
      {
        icon: TrendingUp,
        label: 'Analytics',
        href: '/admin/analytics',
        keywords: ['reports', 'revenue'],
      },
      {
        icon: Sparkles,
        label: 'Innovate',
        href: '/innovate',
        keywords: ['studio', 'visualizer', 'atelier', 'backdrop', 'vip', 'custom'],
      },
    ],
  },
  {
    title: 'Pipeline',
    items: [
      {
        icon: ShoppingCart,
        label: 'Orders',
        href: '/admin/orders',
        permission: 'orders.view',
        keywords: ['sales', 'bookings'],
      },
      {
        icon: FileText,
        label: 'Leads',
        href: '/admin/consultations',
        keywords: ['consultations', 'inquiries', 'crm'],
      },
      {
        icon: CalendarCheck,
        label: 'Appointments',
        href: '/admin/appointments',
        keywords: ['showroom', 'visits'],
      },
      {
        icon: MessageSquare,
        label: 'Messages',
        href: '/admin/messages',
        keywords: ['inbox', 'chat'],
      },
      {
        icon: Users,
        label: 'Customers',
        href: '/admin/customers',
        permission: 'customers.view',
        keywords: ['clients'],
      },
    ],
  },
  {
    title: 'Fulfillment',
    items: [
      {
        icon: CalendarDays,
        label: 'Warehouse schedule',
        href: '/admin/warehouse/schedule',
        keywords: ['pick', 'pack', 'load', 'warehouse tasks'],
      },
      { icon: QrCode, label: 'Scanner', href: '/admin/scan', keywords: ['qr', 'pick'] },
      {
        icon: FileOutput,
        label: 'Pack slips',
        href: '/admin/pack-slip',
        keywords: ['packing', 'warehouse slip'],
      },
      { icon: Box, label: 'Delivery', href: '/admin/delivery', keywords: ['routes', 'dropoff'] },
      { icon: Briefcase, label: 'Bags', href: '/admin/bags', keywords: ['kits', 'manifests'] },
      { icon: Archive, label: 'Inventory', href: '/admin/inventory', keywords: ['stock'] },
      {
        icon: MapPin,
        label: 'Warehouse',
        href: '/admin/warehouse/locations',
        keywords: ['locations', 'bins'],
      },
      { icon: CheckSquare, label: 'Tasks', href: '/admin/tasks', keywords: ['todo', 'team'] },
      { icon: Truck, label: 'Logistics', href: '/admin/logistics', keywords: ['hub', 'ops', 'map'] },
    ],
  },
  {
    title: 'Catalog',
    defaultCollapsed: true,
    items: [
      {
        icon: Package,
        label: 'Products',
        href: '/admin/products',
        permission: 'products.view',
        keywords: ['items', 'rentals'],
      },
      { icon: Layers, label: 'Categories', href: '/admin/categories', keywords: ['taxonomy'] },
      { icon: ClipboardList, label: 'Packages', href: '/admin/packages', keywords: ['bundles'] },
      {
        icon: ImageIcon,
        label: 'Portfolio',
        href: '/admin/portfolio',
        keywords: ['gallery', 'events'],
      },
      {
        icon: PenLine,
        label: 'Site editor',
        href: '/admin/visual-editor',
        keywords: ['cms', 'content', 'visual'],
      },
    ],
  },
  {
    title: 'Manage',
    defaultCollapsed: true,
    items: [
      {
        icon: Handshake,
        label: 'Preferred partners',
        href: '/admin/partners',
        keywords: ['planners', 'decorators', 'preferred', 'trade', 'partner', 'vendor'],
      },
      {
        icon: Tag,
        label: 'Discounts',
        href: '/admin/marketing/discounts',
        keywords: ['coupons', 'promo', 'marketing'],
      },
      {
        icon: UserCog,
        label: 'Staff',
        href: '/admin/team',
        permission: 'users.view',
        keywords: ['users', 'roles', 'permissions'],
      },
      {
        icon: CalendarDays,
        label: 'Staff shifts',
        href: '/admin/team/shifts',
        keywords: ['schedule', 'shifts', 'roster'],
      },
      {
        icon: Settings,
        label: 'Settings',
        href: '/admin/settings',
        permission: 'settings.view',
        keywords: ['company', 'hours'],
      },
    ],
  },
]

export const ADMIN_QUICK_ACTIONS: AdminNavItem[] = [
  { icon: Plus, label: 'New order', href: '/admin/orders/new', keywords: ['create'] },
  {
    icon: ClipboardCheck,
    label: 'Open Week Prep',
    href: '/admin/week-prep',
    keywords: ['weekend', 'prep', 'ready'],
  },
  { icon: Plus, label: 'New product', href: '/admin/products/new', keywords: ['add', 'create'] },
  { icon: Plus, label: 'New package', href: '/admin/packages/new', keywords: ['add', 'create'] },
  {
    icon: Handshake,
    label: 'Review partners',
    href: '/admin/partners',
    keywords: ['approve', 'planner', 'preferred'],
  },
]

/** Primary mobile tabs (scan + menu are chrome, not listed here) */
export const ADMIN_MOBILE_TABS: AdminNavItem[] = [
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: ClipboardCheck, label: 'Week Prep', href: '/admin/week-prep' },
  { icon: MessageSquare, label: 'Inbox', href: '/admin/messages' },
]

export function isAdminRouteActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function flattenAdminNav(): AdminNavItem[] {
  return ADMIN_NAV_GROUPS.flatMap((group) => group.items)
}

/** Client-side permission check mirroring server manage.* inheritance + admin role */
export function canAccessNavItem(
  permissionNames: string[] | null | undefined,
  roleNames: string[] | null | undefined,
  item: AdminNavItem,
): boolean {
  if (!item.permission) return true
  // Until permissions load, show all items to avoid empty nav flash
  if (permissionNames == null) return true
  if (roleNames?.includes('admin')) return true
  if (permissionNames.includes(item.permission)) return true
  const [resource] = item.permission.split('.')
  if (resource && permissionNames.includes(`${resource}.manage`)) return true
  return false
}

export function filterNavGroupsByPermission(
  groups: AdminNavGroup[],
  permissionNames: string[] | null | undefined,
  roleNames: string[] | null | undefined = null,
): AdminNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessNavItem(permissionNames, roleNames, item)),
    }))
    .filter((group) => group.items.length > 0)
}

/** Staff field shell — fulfillment-focused; Catalog/Manage/Analytics behind command palette only conceptually by omission */
const STAFF_ALLOWED_HREFS = new Set([
  '/admin',
  '/admin/week-prep',
  '/admin/orders',
  '/admin/calendar',
  '/admin/messages',
  '/admin/warehouse/schedule',
  '/admin/warehouse/locations',
  '/admin/scan',
  '/admin/pack-slip',
  '/admin/delivery',
  '/admin/bags',
  '/admin/inventory',
  '/admin/tasks',
  '/admin/logistics',
])

export function filterNavGroupsForStaff(
  groups: AdminNavGroup[],
  permissionNames: string[] | null | undefined,
  roleNames: string[] | null | undefined = null,
): AdminNavGroup[] {
  const byPerm = filterNavGroupsByPermission(groups, permissionNames, roleNames)
  const isStaffOnly =
    roleNames?.includes('staff') &&
    !roleNames?.includes('admin') &&
    !roleNames?.includes('manager')

  if (!isStaffOnly) return byPerm

  return byPerm
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => STAFF_ALLOWED_HREFS.has(item.href)),
    }))
    .filter((group) => group.items.length > 0)
}

/** Mobile tabs for staff field shell (Scan stays the center chrome control) */
export const STAFF_MOBILE_TABS: AdminNavItem[] = [
  { icon: CheckSquare, label: 'Tasks', href: '/admin/tasks' },
  { icon: Truck, label: 'Loads', href: '/admin/warehouse/schedule' },
]
