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
    MessageSquare,
    Handshake,
    Percent,
    Share2,
    ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
                                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/10 font-semibold text-primary shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'h-4 w-4',
                                        isActive ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                />
                                {item.title}
                            </Link>
                        )
                    })}

                    <div className="mt-4 space-y-2 border-t pt-4">
                        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
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
                                            'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200',
                                            isActive
                                                ? 'bg-primary/10 font-semibold text-primary shadow-sm'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'h-4 w-4',
                                                isActive ? 'text-primary' : 'text-muted-foreground'
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
                                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200',
                                    pathname.startsWith('/account/partner')
                                        ? 'bg-primary/10 font-semibold text-primary shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
            <div className="mt-auto border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-background text-foreground md:flex">
            <div className="flex h-16 items-center border-b px-6">
                <Link
                    className="flex items-center gap-2 font-serif text-lg font-semibold tracking-wide"
                    href="/"
                >
                    <span>PrimeLux Portal</span>
                </Link>
            </div>
            <AccountNav partnerStatus={partnerStatus} />
        </aside>
    )
}
