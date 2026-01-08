'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    ShoppingBag,
    FileText,
    Package,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Box,
    Layers,
    ClipboardList,
    Eye,
    CalendarCheck,
    Search,
    ChevronRight,
    UserCog,
    CheckSquare,
    QrCode,
    Truck,
    TrendingUp
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

const sidebarGroups = [
    {
        title: "Overview",
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
            { icon: TrendingUp, label: 'Analytics', href: '/admin/analytics' },
        ]
    },
    {
        title: "Sales & Operations",
        items: [
            { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
            { icon: FileText, label: 'Leads', href: '/admin/consultations' },
            { icon: CalendarCheck, label: 'Appointments', href: '/admin/appointments' },
            { icon: Truck, label: 'Logistics', href: '/admin/logistics' },
            { icon: ShoppingBag, label: 'Bags', href: '/admin/bags' },
            { icon: CheckSquare, label: 'Tasks', href: '/admin/tasks' },
            { icon: QrCode, label: 'Scan', href: '/admin/scan' },
            { icon: ClipboardList, label: 'Pack Slip', href: '/admin/pack-slip' },
        ]
    },
    {
        title: "Catalog",
        items: [
            { icon: Package, label: 'Products', href: '/admin/products' },
            { icon: Layers, label: 'Categories', href: '/admin/categories' },
            { icon: Box, label: 'Packages', href: '/admin/packages' },
            { icon: ClipboardList, label: 'Portfolio', href: '/admin/portfolio' },
            { icon: Box, label: 'Inventory', href: '/admin/inventory' },
        ]
    },
    {
        title: "Management",
        items: [
            { icon: Users, label: 'Customers', href: '/admin/customers' },
            { icon: UserCog, label: 'Team', href: '/admin/team' },
        ]
    },
    {
        title: "System",
        items: [
            { icon: Eye, label: 'Visual Editor', href: '/admin/visual-editor' },
            { icon: Settings, label: 'Settings', href: '/admin/settings' },
        ]
    }
]

import { useAdminSidebar } from './sidebar-context'

export function ModernSidebar() {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { isCollapsed, setIsCollapsed } = useAdminSidebar()

    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    return (
        <>
            {/* Mobile Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden text-[var(--dashboard-text)]"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out glass-morphism border-r border-[var(--dashboard-border)]",
                    isCollapsed ? "w-20" : "w-64",
                    "md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 pb-4 flex items-center justify-between">
                    <div className={cn("flex items-center gap-3 transition-opacity duration-300", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--dashboard-accent-gold)] to-yellow-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                            P
                        </div>
                        <span className="font-semibold text-lg text-[var(--dashboard-text)] tracking-tight">PrimeLux</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-8 mt-4 scrollbar-hide">
                    {sidebarGroups.map((group, groupIndex) => (
                        <div key={group.title} className="space-y-2">
                            {!isCollapsed && (
                                <h3 className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-[0.2em] mb-4 px-3 opacity-50">
                                    {group.title}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item, index) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                                                isActive
                                                    ? "bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] shadow-[inset_0_0_10px_rgba(212,175,55,0.05)]"
                                                    : "text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)]"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                                isActive ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-text)]"
                                            )} />
                                            {!isCollapsed && <span className="truncate">{item.label}</span>}

                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute left-0 w-1 h-6 rounded-r-full bg-[var(--dashboard-accent-gold)] shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                                                />
                                            )}

                                            {isCollapsed && (
                                                <div className="absolute left-14 px-2 py-1 rounded bg-[var(--dashboard-card)] text-[var(--dashboard-text)] text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-[var(--dashboard-border)] shadow-xl">
                                                    {item.label}
                                                </div>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-[var(--dashboard-border)] bg-black/20">
                    <div className={cn(
                        "flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--dashboard-card-hover)] cursor-pointer transition-all duration-200 group",
                        isCollapsed && "justify-center"
                    )}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text-muted)] shrink-0 shadow-lg">
                            <Users className="h-5 w-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--dashboard-text)] truncate">
                                    {user?.user_metadata?.full_name || "Admin User"}
                                </p>
                                <p className="text-[10px] text-[var(--dashboard-text-muted)] truncate uppercase tracking-wider">
                                    Administrator
                                </p>
                            </div>
                        )}
                        {!isCollapsed && (
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut()
                                    window.location.href = '/'
                                }}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group/logout"
                            >
                                <LogOut className="h-4 w-4 text-[var(--dashboard-text-muted)] group-hover/logout:text-red-500" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>


        </>
    )
}
