'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePwaContext } from '@/components/providers/pwa-provider'

const navItems = [
  { title: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { title: 'Orders', href: '/account/orders', icon: ShoppingCart },
  { title: 'Profile', href: '/account/profile', icon: User },
  { title: 'Settings', href: '/account/settings', icon: Settings },
]

export function AccountBottomBar() {
  const pathname = usePathname()
  const { isStandalone } = usePwaContext()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-xl md:hidden',
        isStandalone && 'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/account' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
