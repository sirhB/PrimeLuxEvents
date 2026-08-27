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

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-[var(--linen,#F7F4EF)]/90 px-4 py-4 backdrop-blur-md md:px-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="mt-0.5 shrink-0 rounded-xl border-[var(--champagne,#B8956B)]/30 md:hidden"
            aria-label="Open menu"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--champagne,#B8956B)]">
              Client portal
            </p>
            <h1 className="font-serif text-2xl font-light tracking-tight text-[var(--ink,#121110)]">
              Hello, {firstName}
            </h1>
          </div>
        </div>

        {upcomingOrderDate ? (
          <div className="rounded-2xl border border-[var(--champagne,#B8956B)]/20 bg-white/70 px-4 py-3 text-sm shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Next delivery
            </p>
            <p className="font-medium text-[var(--ink,#121110)]">
              {new Date(upcomingOrderDate).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            {upcomingOrderStatus && (
              <p className="mt-1 text-xs capitalize text-[var(--sage,#8A9A8B)]">{upcomingOrderStatus}</p>
            )}
          </div>
        ) : (
          <Button asChild variant="outline" className="rounded-full border-[var(--champagne,#B8956B)]/30">
            <Link href="/catalog" className="gap-2">
              Browse collection <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-[min(100%,20rem)] gap-0 p-0">
          <SheetHeader className="border-b px-6 py-5 text-left">
            <SheetTitle className="font-serif text-lg font-semibold tracking-wide">
              PrimeLux Portal
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
