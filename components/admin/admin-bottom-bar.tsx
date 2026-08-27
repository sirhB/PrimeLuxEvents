'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminSidebar } from '@/components/admin/sidebar-context'
import { ScanModal } from '@/components/admin/scan-modal'
import { ADMIN_MOBILE_TABS, isAdminRouteActive } from '@/lib/admin/nav'

export function AdminBottomBar() {
  const pathname = usePathname()
  const { counts, isMobileOpen, setIsMobileOpen } = useAdminSidebar()
  const [isScanOpen, setIsScanOpen] = useState(false)

  const badgeFor = (href: string) => {
    if (href === '/admin/orders') return counts.orders
    if (href === '/admin/consultations') return counts.leads
    if (href === '/admin/messages') return counts.messages
    return 0
  }

  const left = ADMIN_MOBILE_TABS.slice(0, 2)
  const right = ADMIN_MOBILE_TABS.slice(2)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden print:hidden">
        <div className="grid grid-cols-5 items-end px-1 pt-1">
          {left.map((item) => {
            const Icon = item.icon
            const isActive = isAdminRouteActive(pathname, item.href)
            const badge = badgeFor(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium',
                  isActive ? 'text-[var(--dashboard-accent-gold)]' : 'text-[var(--dashboard-text-muted)]',
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--dashboard-accent-gold)] px-1 text-[9px] font-bold text-[#121110]">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setIsScanOpen(true)}
            className="-mt-4 flex flex-col items-center gap-0.5 text-[10px] font-medium text-[var(--dashboard-text-muted)]"
            aria-label="Open scanner"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--dashboard-accent-gold)]/40 bg-[var(--dashboard-accent-gold)] text-[#121110] shadow-[0_8px_20px_-8px_rgba(196,165,116,0.7)]">
              <QrCode className="h-5 w-5" />
            </span>
            Scan
          </button>

          {right.map((item) => {
            const Icon = item.icon
            const isActive = isAdminRouteActive(pathname, item.href)
            const badge = badgeFor(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium',
                  isActive ? 'text-[var(--dashboard-accent-gold)]' : 'text-[var(--dashboard-text-muted)]',
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--dashboard-accent-gold)] px-1 text-[9px] font-bold text-[#121110]">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium',
              isMobileOpen ? 'text-[var(--dashboard-accent-gold)]' : 'text-[var(--dashboard-text-muted)]',
            )}
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
        </div>
      </nav>

      <ScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
    </>
  )
}
