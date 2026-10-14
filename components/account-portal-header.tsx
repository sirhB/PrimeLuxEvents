'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { AccountNav, type PartnerNavStatus } from '@/components/account-sidebar'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { BrandLockup } from '@/components/brand/brand-logo'

interface AccountPortalHeaderProps {
  userName: string
  upcomingOrderDate?: string | null
  upcomingOrderStatus?: string | null
  partnerStatus?: PartnerNavStatus
}

export function AccountPortalHeader({
  userName,
  upcomingOrderDate,
  upcomingOrderStatus,
  partnerStatus = 'none',
}: AccountPortalHeaderProps) {
  const firstName = userName.split(' ')[0] || userName
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--dashboard-border)] bg-white/85 px-4 py-4 backdrop-blur-md md:px-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mt-0.5 shrink-0 rounded-2xl bg-white md:hidden"
            aria-label="Open menu"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--dashboard-text-muted)]">Client portal</p>
            <h1 className="font-sans text-2xl font-semibold tracking-tight text-[var(--dashboard-text)] sm:text-3xl">
              {greeting}, {firstName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher className="h-9 px-2.5" />
        {upcomingOrderDate ? (
          <div className="rounded-2xl border border-[var(--dashboard-border)] bg-white px-4 py-3 text-sm shadow-[var(--dashboard-shadow)]">
            <p className="text-xs font-medium text-[var(--dashboard-text-muted)]">
              Next delivery
            </p>
            <p className="font-semibold text-[var(--dashboard-text)]">
              {new Date(upcomingOrderDate).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            {upcomingOrderStatus && (
              <p className="mt-1 text-xs font-medium capitalize text-[var(--dashboard-accent-green)]">{upcomingOrderStatus}</p>
            )}
          </div>
        ) : (
          <Button asChild className="rounded-full">
            <Link href="/catalog" className="gap-2">
              Browse collection <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
        </div>
      </div>

      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-[min(100%,20rem)] gap-0 border-white/10 bg-[var(--sidebar-navy)] p-0 text-[var(--sidebar-navy-text)]">
          <SheetHeader className="border-b border-white/10 px-6 py-5 text-left">
            <SheetTitle className="text-white">
              <BrandLockup tone="on-dark" className="text-[1rem]" />
              <span className="sr-only">Prime Lux Events</span>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Account navigation
            </SheetDescription>
          </SheetHeader>
          <AccountNav
            onNavigate={() => setIsMobileNavOpen(false)}
            partnerStatus={partnerStatus}
          />
        </SheetContent>
      </Sheet>
    </header>
  )
}
