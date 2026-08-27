"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ShoppingCart,
    MessageSquare,
    FileText,
    Menu,
    QrCode,
    Search
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAdminSidebar } from "@/components/admin/sidebar-context"
import { SearchModal } from "@/components/search-modal"
import { ScanModal } from "@/components/admin/scan-modal"

const bottomNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", badgeKey: null },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders", badgeKey: 'orders' },
    { icon: FileText, label: "Leads", href: "/admin/consultations", badgeKey: 'leads' },
    { icon: MessageSquare, label: "Messages", href: "/admin/messages", badgeKey: 'messages' },
]

export function AdminBottomBar() {
    const pathname = usePathname()
    const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useAdminSidebar()
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isScanOpen, setIsScanOpen] = useState(false)
    const [counts, setCounts] = useState<Record<string, number>>({ orders: 0, leads: 0, messages: 0 })
    const supabase = createClient()

    useEffect(() => {
        async function fetchCounts() {
            try {
                // 1. Fetch Pending Orders Count
                const { count: ordersCount } = await supabase
                    .from('orders')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'pending')

                // 2. Fetch New Leads Count
                const { count: leadsCount } = await supabase
                    .from('consultations')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'new_request')

                // 3. Fetch Unread Message Notifications Count
                const { count: messagesCount } = await supabase
                    .from('admin_notifications')
                    .select('id', { count: 'exact', head: true })
                    .eq('is_read', false)
                    .eq('type', 'new_message')

                setCounts({
                    orders: ordersCount || 0,
                    leads: leadsCount || 0,
                    messages: messagesCount || 0
                })
            } catch (error) {
                console.error('Error fetching admin counts:', error)
            }
        }

        fetchCounts()

        // Subscribe to changes for real-time updates
        const channels = [
            supabase.channel('bottom-bar-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchCounts).subscribe(),
            supabase.channel('bottom-bar-leads').on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, fetchCounts).subscribe(),
            supabase.channel('bottom-bar-notifs').on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notifications' }, fetchCounts).subscribe(),
        ]

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel))
        }
    }, [])

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
                                    "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] relative",
                                    isActive
                                        ? "text-[var(--dashboard-accent-gold)]"
                                        : "text-[var(--dashboard-text-muted)]"
                                )}
                            >
                                <div className="relative">
                                    <Icon className={cn(
                                        "h-6 w-6 transition-all duration-200",
                                        isActive && "scale-110"
                                    )} />
                                    {item.badgeKey && counts[item.badgeKey as string] > 0 && (
                                        <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--dashboard-accent-gold)] text-[9px] font-bold text-black border-2 border-[var(--dashboard-background)] px-1 shadow-lg shadow-black/20">
                                            {counts[item.badgeKey as string] > 99 ? '99+' : counts[item.badgeKey as string]}
                                        </span>
                                    )}
                                </div>
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
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px]",
                            isMobileOpen ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text-muted)]"
                        )}
                    >
                        <Menu className={cn(
                            "h-6 w-6 transition-all duration-200",
                            isMobileOpen && "scale-110"
                        )} />
                        <span className="text-[10px] font-medium transition-all duration-200">
                            Menu
                        </span>
                    </button>
                </div>

                {/* Second Row: QR Code and Search */}
                <div className="flex items-center justify-center gap-4 px-2 pb-2">
                    <button
                        onClick={() => setIsScanOpen(true)}
                        className={cn(
                            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)]",
                            isScanOpen
                                ? "text-[var(--dashboard-accent-gold)] border-[var(--dashboard-accent-gold)]"
                                : "text-[var(--dashboard-text-muted)]"
                        )}
                    >
                        <QrCode className="h-5 w-5" />
                        <span className="text-xs font-medium">Scan QR</span>
                    </button>

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
            <ScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
        </>
    )
}
