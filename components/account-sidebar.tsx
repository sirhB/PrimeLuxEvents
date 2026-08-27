'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const sidebarItems = [
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

export function AccountSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Error signing out')
            return
        }
        router.push('/')
        router.refresh()
    }

    return (
        <div className="hidden h-screen w-64 shrink-0 flex-col border-r bg-background text-foreground md:sticky md:top-0 md:flex">
            <div className="flex h-16 items-center border-b px-6">
                <Link className="flex items-center gap-2 font-serif font-semibold tracking-wide text-lg" href="/">
                    <span className="">PrimeLux Portal</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-6">
                <nav className="grid items-start px-4 text-sm font-medium gap-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/10 text-primary shadow-sm font-semibold'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
