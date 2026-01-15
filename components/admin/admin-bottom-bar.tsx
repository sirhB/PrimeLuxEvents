"use client"

import { usePathname } from "next/navigation"
import { useCapacitor } from "@/components/providers/capacitor-provider"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ShoppingCart,
    MessageSquare,
    Package,
    Menu,
    QrCode,
    Search
} from "lucide-react"
import { useState } from "react"
import { useAdminSidebar } from "@/components/admin/sidebar-context"
import { SearchModal } from "@/components/search-modal"

const bottomNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
]

export function AdminBottomBar() {
    const { isNative } = useCapacitor()
    const pathname = usePathname()
    const { isCollapsed, setIsCollapsed } = useAdminSidebar()
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Only show on native Capacitor apps
    if (!isNative) {
        return null
    }

    const isRouteActive = (href: string) => {
        if (href === '/admin' && pathname === '/admin') return true
        if (href !== '/admin' && pathname.startsWith(href)) return true
        return false
    }

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--dashboard-background)]/95 backdrop-blur-xl border-t border-[var(--dashboard-border)] pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around px-2 py-2">
                    {bottomNavItems.map((item) => {
                        const Icon = item.icon
                        const isActive = isRouteActive(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                                    isActive
                                        ? "text-[var(--dashboard-accent-gold)]"
                                        : "text-[var(--dashboard-text-muted)]"
                                )}
                            >
                                <Icon className={cn(
                                    "h-6 w-6 transition-all duration-200",
                                    isActive && "scale-110"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-medium transition-all duration-200",
                                    isActive && "font-semibold"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[var(--dashboard-accent-gold)] rounded-b-full" />
                                )}
                            </Link>
                        )
                    })}

                    {/* Menu Icon */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] text-[var(--dashboard-text-muted)]"
                    >
                        <Menu className="h-6 w-6 transition-all duration-200" />
                        <span className="text-[10px] font-medium transition-all duration-200">
                            Menu
                        </span>
                    </button>
                </div>

                {/* Second Row: QR Code and Search */}
                <div className="flex items-center justify-center gap-4 px-2 pb-2">
                    <Link
                        href="/admin/scan"
                        className={cn(
                            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)]",
                            pathname === '/admin/scan'
                                ? "text-[var(--dashboard-accent-gold)] border-[var(--dashboard-accent-gold)]"
                                : "text-[var(--dashboard-text-muted)]"
                        )}
                    >
                        <QrCode className="h-5 w-5" />
                        <span className="text-xs font-medium">Scan QR</span>
                    </Link>

                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[var(--dashboard-text-muted)]"
                    >
                        <Search className="h-5 w-5" />
                        <span className="text-xs font-medium">Search</span>
                    </button>
                </div>
            </nav>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    )
}
