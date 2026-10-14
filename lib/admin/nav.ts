import type { LucideIcon } from 'lucide-react'
import { userHasPermission } from '@/lib/auth/permission-catalog'
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
  KeyRound,
  Landmark,
  NotebookPen,
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
        permission: 'orders.view',
        keywords: ['weekend', 'prep', 'readiness', 'fulfillment'],
      },
      { icon: Calendar, label: 'Calendar', href: '/admin/calendar', permission: 'orders.view', keywords: ['schedule'] },
      { icon: Activity, label: 'Activity', href: '/admin/activity', permission: 'settings.view', keywords: ['feed', 'audit'] },
      {
        icon: TrendingUp,
        label: 'Ops Intelligence',
        href: '/admin/analytics',
        permission: 'reports.view',
        keywords: ['reports', 'revenue', 'analytics', 'gmv', 'intelligence', 'funnel'],
      },
      {
        icon: Sparkles,
        label: 'Innovate',
        href: '/innovate',
        permission: 'innovate.view',
        keywords: ['studio', 'visualizer', 'atelier', 'backdrop', 'vip', 'custom'],
      },
    ],
  },
  {
    title: 'Venue',
    items: [
      {
        icon: Landmark,
        label: 'Venue desk',
        href: '/admin/venue',
        permission: 'venues.view',
        keywords: ['venue', 'crm', 'tours', 'bookings', 'rooms'],
      },
      {
        icon: NotebookPen,
        label: 'Event plans',
        href: '/admin/event-plans',
        permission: 'consultations.view',
        keywords: ['plan', 'inquiry', 'budget', 'guests'],
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
        permission: 'consultations.view',
        keywords: ['consultations', 'inquiries', 'crm'],
      },
      {
        icon: CalendarCheck,
        label: 'Appointments',
        href: '/admin/appointments',
        permission: 'appointments.view',
        keywords: ['showroom', 'visits'],
      },
      {
        icon: MessageSquare,
        label: 'Messages',
        href: '/admin/messages',
        permission: 'customers.view',
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
        permission: 'orders.view',
        keywords: ['pick', 'pack', 'load', 'warehouse tasks'],
      },
      { icon: QrCode, label: 'Scanner', href: '/admin/scan', permission: 'orders.view', keywords: ['qr', 'pick'] },
      {
        icon: FileOutput,
        label: 'Pack slips',
        href: '/admin/pack-slip',
        permission: 'orders.view',
        keywords: ['packing', 'warehouse slip'],
      },
      { icon: Box, label: 'Delivery', href: '/admin/delivery', permission: 'delivery.view', keywords: ['routes', 'dropoff'] },
      { icon: Briefcase, label: 'Bags', href: '/admin/bags', permission: 'orders.view', keywords: ['kits', 'manifests'] },
      { icon: Archive, label: 'Inventory', href: '/admin/inventory', permission: 'orders.view', keywords: ['stock'] },
      {
        icon: MapPin,
        label: 'Warehouse',
        href: '/admin/warehouse/locations',
        permission: 'orders.view',
        keywords: ['locations', 'bins'],
      },
      { icon: CheckSquare, label: 'Tasks', href: '/admin/tasks', permission: 'orders.view', keywords: ['todo', 'team'] },
      { icon: Truck, label: 'Logistics', href: '/admin/logistics', permission: 'orders.view', keywords: ['hub', 'ops', 'map'] },
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
      { icon: Layers, label: 'Categories', href: '/admin/categories', permission: 'catalog.view', keywords: ['taxonomy'] },
      { icon: ClipboardList, label: 'Packages', href: '/admin/packages', permission: 'catalog.view', keywords: ['bundles'] },
      {
        icon: ImageIcon,
        label: 'Portfolio',
        href: '/admin/portfolio',
        permission: 'portfolio.view',
        keywords: ['gallery', 'events'],
      },
      {
        icon: PenLine,
        label: 'Site editor',
        href: '/admin/visual-editor',
        permission: 'visual_editor.view',
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
        permission: 'customers.view',
        keywords: ['planners', 'decorators', 'preferred', 'trade', 'partner', 'vendor'],
      },
      {
        icon: Tag,
        label: 'Discounts',
        href: '/admin/marketing/discounts',
        permission: 'discounts.view',
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
        permission: 'shifts.view',
        keywords: ['schedule', 'shifts', 'roster'],
      },
      {
        icon: KeyRound,
        label: 'API keys',
        href: '/admin/api-keys',
        permission: 'settings.view',
        keywords: ['api', 'developers', 'integrations', 'catalog', 'token'],
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
  { icon: Plus, label: 'New order', href: '/admin/orders/new', permission: 'orders.create', keywords: ['create'] },
  {
    icon: ClipboardCheck,
    label: 'Open Week Prep',
    href: '/admin/week-prep',
    permission: 'orders.view',
    keywords: ['weekend', 'prep', 'ready'],
  },
  { icon: Plus, label: 'New product', href: '/admin/products/new', permission: 'products.create', keywords: ['add', 'create'] },
  { icon: Plus, label: 'New package', href: '/admin/packages/new', permission: 'catalog.create', keywords: ['add', 'create'] },
  {
    icon: Handshake,
    label: 'Review partners',
    href: '/admin/partners',
    permission: 'customers.view',
    keywords: ['approve', 'planner', 'preferred'],
  },
]

/** Primary mobile tabs (scan + menu are chrome, not listed here) */
export const ADMIN_MOBILE_TABS: AdminNavItem[] = [
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders', permission: 'orders.view' },
  { icon: ClipboardCheck, label: 'Week Prep', href: '/admin/week-prep', permission: 'orders.view' },
  { icon: MessageSquare, label: 'Inbox', href: '/admin/messages', permission: 'customers.view' },
]

export function isAdminRouteActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function flattenAdminNav(): AdminNavItem[] {
  return ADMIN_NAV_GROUPS.flatMap((group) => group.items)
}

/** Client-side permission check. super_admin bypasses; resource.manage covers that resource. */
export function canAccessNavItem(
  permissionNames: string[] | null | undefined,
  roleNames: string[] | null | undefined,
  item: AdminNavItem,
  bridge = false,
): boolean {
  if (!item.permission) return true
  // Until permissions load, show all items to avoid an empty nav flash
  if (permissionNames == null || roleNames == null) return true
  return userHasPermission(
    {
      roles: roleNames.map((name) => ({ name })),
      permissions: permissionNames.map((name) => ({ name })),
    },
    item.permission,
    { bridge },
  )
}

export function filterNavGroupsByPermission(
  groups: AdminNavGroup[],
  permissionNames: string[] | null | undefined,
  roleNames: string[] | null | undefined = null,
  bridge = false,
): AdminNavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessNavItem(permissionNames, roleNames, item, bridge)),
    }))
    .filter((group) => group.items.length > 0)
}
