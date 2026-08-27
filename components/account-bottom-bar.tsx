'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Heart, CalendarCheck, Handshake } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePwaContext } from '@/components/providers/pwa-provider'
import type { PartnerNavStatus } from '@/components/account-sidebar'

export function AccountBottomBar({ partnerStatus = 'none' }: { partnerStatus?: PartnerNavStatus }) {
  const pathname = usePathname()
  const { isStandalone } = usePwaContext()

  const navItems = [
    { title: 'Home', href: '/account', icon: LayoutDashboard },
    { title: 'Orders', href: '/account/orders', icon: ShoppingCart },
    partnerStatus === 'active'
      ? { title: 'Partner', href: '/account/partner', icon: Handshake }
      : { title: 'Saved', href: '/account/favorites', icon: Heart },
    { title: 'Visits', href: '/account/appointments', icon: CalendarCheck },
    partnerStatus === 'active'
      ? { title: 'Carts', href: '/account/partner/carts', icon: ShoppingCart }
      : { title: 'Saved', href: '/account/favorites', icon: Heart },
  ]

  // Dedupe if both slots would be Saved for non-partners
  const seen = new Set<string>()
  const items = navItems.filter((item) => {
    if (seen.has(item.href)) return false
    seen.add(item.href)
    return true
  })

  // Ensure non-partners still get Chat-like fifth slot: favorites already covered;
  // keep 4–5 items max
  const finalItems =
    partnerStatus === 'active'
      ? items
      : [
          { title: 'Home', href: '/account', icon: LayoutDashboard },
          { title: 'Orders', href: '/account/orders', icon: ShoppingCart },
          { title: 'Saved', href: '/account/favorites', icon: Heart },
          { title: 'Visits', href: '/account/appointments', icon: CalendarCheck },
        ]

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-xl md:hidden',
        isStandalone && 'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {finalItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
