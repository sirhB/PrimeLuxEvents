import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
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
}

/** Canonical admin information architecture */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: 'Home',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', keywords: ['home', 'overview'] },
      { icon: TrendingUp, label: 'Analytics', href: '/admin/analytics', keywords: ['reports', 'revenue'] },
      { icon: Activity, label: 'Activity', href: '/admin/activity', keywords: ['feed', 'audit'] },
    ],
  },
  {
    title: 'Pipeline',
    items: [
      { icon: ShoppingCart, label: 'Orders', href: '/admin/orders', permission: 'orders.view', keywords: ['sales', 'bookings'] },
      { icon: FileText, label: 'Leads', href: '/admin/consultations', keywords: ['consultations', 'inquiries', 'crm'] },
      { icon: CalendarCheck, label: 'Appointments', href: '/admin/appointments', keywords: ['showroom', 'visits'] },
      { icon: MessageSquare, label: 'Messages', href: '/admin/messages', keywords: ['inbox', 'chat'] },
      { icon: Users, label: 'Customers', href: '/admin/customers', permission: 'customers.view', keywords: ['clients'] },
      { icon: Tag, label: 'Discounts', href: '/admin/marketing/discounts', keywords: ['coupons', 'promo', 'marketing'] },
    ],
  },
  {
    title: 'Fulfillment',
    items: [
      { icon: Truck, label: 'Logistics', href: '/admin/logistics', keywords: ['hub', 'ops'] },
      { icon: CalendarDays, label: 'Warehouse schedule', href: '/admin/warehouse/schedule', keywords: ['pick', 'pack', 'load', 'warehouse tasks'] },
      { icon: Box, label: 'Delivery', href: '/admin/delivery', keywords: ['routes', 'dropoff'] },
      { icon: QrCode, label: 'Scanner', href: '/admin/scan', keywords: ['qr', 'pick'] },
      { icon: FileOutput, label: 'Pack slips', href: '/admin/pack-slip', keywords: ['packing', 'warehouse slip'] },
      { icon: Archive, label: 'Inventory', href: '/admin/inventory', keywords: ['stock'] },
      { icon: MapPin, label: 'Warehouse', href: '/admin/warehouse/locations', keywords: ['locations', 'bins'] },
      { icon: Briefcase, label: 'Bags', href: '/admin/bags', keywords: ['kits', 'manifests'] },
      { icon: CheckSquare, label: 'Tasks', href: '/admin/tasks', keywords: ['todo', 'team'] },
      { icon: Calendar, label: 'Calendar', href: '/admin/calendar', keywords: ['schedule'] },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { icon: Package, label: 'Products', href: '/admin/products', permission: 'products.view', keywords: ['items', 'rentals'] },
      { icon: Layers, label: 'Categories', href: '/admin/categories', keywords: ['taxonomy'] },
      { icon: ClipboardList, label: 'Packages', href: '/admin/packages', keywords: ['bundles'] },
      { icon: ImageIcon, label: 'Portfolio', href: '/admin/portfolio', keywords: ['gallery', 'events'] },
      { icon: PenLine, label: 'Site editor', href: '/admin/visual-editor', keywords: ['cms', 'content', 'visual'] },
    ],
  },
  {
    title: 'Admin',
    items: [
      { icon: UserCog, label: 'Staff', href: '/admin/team', permission: 'team.view', keywords: ['users', 'roles', 'permissions'] },
      { icon: CalendarDays, label: 'Staff shifts', href: '/admin/team/shifts', keywords: ['schedule', 'shifts', 'roster'] },
      { icon: Settings, label: 'Settings', href: '/admin/settings', permission: 'settings.view', keywords: ['company', 'hours'] },
    ],
  },
]

export const ADMIN_QUICK_ACTIONS: AdminNavItem[] = [
  { icon: Plus, label: 'New order', href: '/admin/orders/new', keywords: ['create'] },
  { icon: Plus, label: 'New product', href: '/admin/products/new', keywords: ['add', 'create'] },
  { icon: Plus, label: 'New package', href: '/admin/packages/new', keywords: ['add', 'create'] },
]

/** Primary mobile tabs (scan + menu are chrome, not listed here) */
export const ADMIN_MOBILE_TABS: AdminNavItem[] = [
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: FileText, label: 'Leads', href: '/admin/consultations' },
  { icon: MessageSquare, label: 'Inbox', href: '/admin/messages' },
]

export function isAdminRouteActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function flattenAdminNav(): AdminNavItem[] {
  return ADMIN_NAV_GROUPS.flatMap((group) => group.items)
}
