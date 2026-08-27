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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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

function isNavItemActive(pathname: string, href: string) {
    return pathname === href || (href !== '/account' && pathname.startsWith(href))
}

export function AccountNav({
    onNavigate,
    className,
}: {
    onNavigate?: () => void
    className?: string
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
export function AccountSidebar() {
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
            <AccountNav />
        </aside>
    )
}
