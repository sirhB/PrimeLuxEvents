import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Frame,
  Lamp,
  Wine,
  QrCode,
} from 'lucide-react'

export type InnovateNavItem = {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export const innovateNavItems: InnovateNavItem[] = [
  {
    title: 'Overview',
    href: '/innovate',
    icon: LayoutDashboard,
    description: 'Innovate workspace hub',
  },
  {
    title: 'Backdrop Studio',
    href: '/innovate/backdrop',
    icon: Frame,
    description: '3D/AI backdrop & floor wrap configurator',
  },
  {
    title: 'PrimeLux Atelier',
    href: '/innovate/atelier',
    icon: Lamp,
    description: 'Atmospheric lighting & vibe planner',
  },
  {
    title: 'Bar Builder',
    href: '/innovate/bar',
    icon: Wine,
    description: 'Modular bar & culinary station customizer',
  },
  {
    title: 'VIP Check-In',
    href: '/innovate/vip',
    icon: QrCode,
    description: 'Guest management & digital passes',
  },
]

export function isInnovateRouteActive(pathname: string, href: string): boolean {
  if (href === '/innovate') return pathname === '/innovate'
  return pathname === href || pathname.startsWith(`${href}/`)
}
