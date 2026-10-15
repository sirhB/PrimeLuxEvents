'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    ShoppingCart,
    User,
    Settings,
    LogOut,
    Heart,
    CalendarCheck,
    CalendarRange,
    MessageSquare,
    Handshake,
    Percent,
    Share2,
    ClipboardList,
    Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLockup } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type PartnerNavStatus = 'none' | 'pending' | 'active' | 'suspended' | 'revoked'

export const accountNavItems = [
    {
        title: 'Dashboard',
        href: '/account',
        icon: LayoutDashboard,
    },
    {
        title: 'My event',
        href: '/account/event',
        icon: CalendarRange,
    },
    {
        title: 'My Orders',
        href: '/account/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Favorites',
        href: '/account/favorites',
        icon: Heart,
    },
    {
        title: 'Appointments',
        href: '/account/appointments',
        icon: CalendarCheck,
    },
    {
        title: 'Messages',
        href: '/account/messages',
        icon: MessageSquare,
    },
    {
        title: 'Profile',
        href: '/account/profile',
        icon: User,
    },
    {
        title: 'Settings',
        href: '/account/settings',
        icon: Settings,
    },
]

const partnerActiveNav = [
    { title: 'Partner home', href: '/account/partner', icon: Handshake },
    { title: 'Shared carts', href: '/account/partner/carts', icon: Share2 },
    { title: 'Trade rates', href: '/account/partner/rates', icon: Percent },
    { title: 'Branding', href: '/account/partner/branding', icon: Palette },
    { title: 'Client payments', href: '/account/partner/payments', icon: ClipboardList },
]

function isNavItemActive(pathname: string, href: string) {
    if (href === '/account/partner') {
        return pathname === '/account/partner'
    }
    return pathname === href || (href !== '/account' && pathname.startsWith(href))
}

export function AccountNav({
    onNavigate,
    className,
    partnerStatus = 'none',
}: {
    onNavigate?: () => void
    className?: string
    partnerStatus?: PartnerNavStatus
}) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Error signing out')
            return
        }
        onNavigate?.()
        router.push('/')
        router.refresh()
    }

    return (
        <div className={cn('flex h-full flex-col', className)}>
            <div className="flex-1 overflow-auto py-6">
                <nav className="grid items-start gap-2 px-4 text-sm font-medium">
                    {accountNavItems.map((item) => {
                        const isActive = isNavItemActive(pathname, item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                                    isActive
                                        ? 'bg-white/10 font-semibold text-white'
                                        : 'text-[var(--sidebar-navy-muted)] hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'h-4 w-4',
                                        isActive ? 'text-[var(--lux-gold-bright)]' : 'text-[var(--sidebar-navy-muted)]'
                                    )}
                                />
                                {item.title}
                            </Link>
                        )
                    })}

                    <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--sidebar-navy-muted)]">
                            Preferred vendor
                        </p>
                        {partnerStatus === 'active' ? (
                            partnerActiveNav.map((item) => {
                                const isActive = isNavItemActive(pathname, item.href)
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                                            isActive
                                                ? 'bg-white/10 font-semibold text-white'
                                                : 'text-[var(--sidebar-navy-muted)] hover:bg-white/5 hover:text-white'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'h-4 w-4',
                                                isActive ? 'text-[var(--lux-gold-bright)]' : 'text-[var(--sidebar-navy-muted)]'
                                            )}
                                        />
                                        {item.title}
                                    </Link>
                                )
                            })
                        ) : (
                            <Link
                                href="/account/partner/apply"
                                onClick={onNavigate}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                                    pathname.startsWith('/account/partner')
                                        ? 'bg-white/10 font-semibold text-white'
                                        : 'text-[var(--sidebar-navy-muted)] hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <ClipboardList className="h-4 w-4" />
                                {partnerStatus === 'pending'
                                    ? 'Application status'
                                    : partnerStatus === 'suspended' || partnerStatus === 'revoked'
                                      ? 'Partner access'
                                      : 'Become a partner'}
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
            <div className="mt-auto border-t border-white/10 p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-xl text-[var(--sidebar-navy-muted)] hover:bg-white/10 hover:text-white"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}

/** Desktop-only sidebar. Mobile uses the bottom bar + header sheet menu. */
export function AccountSidebar({ partnerStatus = 'none' }: { partnerStatus?: PartnerNavStatus }) {
    return (
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-[var(--sidebar-navy)] text-[var(--sidebar-navy-text)] md:flex">
            <div className="flex items-center justify-center border-b border-white/10 px-4 py-5">
                <Link href="/" aria-label="Prime Lux Events" className="inline-flex">
                    <BrandLockup tone="on-dark" className="text-[1rem]" />
                </Link>
            </div>
            <AccountNav partnerStatus={partnerStatus} />
        </aside>
    )
}
