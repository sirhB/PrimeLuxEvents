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
    ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const sidebarGroups = [
    {
        title: "Overview",
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        ]
    },
    {
        title: "Sales & Operations",
        items: [
            { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
            { icon: FileText, label: 'Consultations', href: '/admin/consultations' },
            { icon: CalendarCheck, label: 'Appointments', href: '/admin/appointments' },
            { icon: ClipboardList, label: 'Pack Slip', href: '/admin/pack-slip' },
        ]
    },
    {
        title: "Catalog",
        items: [
            { icon: Package, label: 'Products', href: '/admin/products' },
            { icon: Layers, label: 'Categories', href: '/admin/categories' },
            { icon: Box, label: 'Inventory', href: '/admin/inventory' },
        ]
    },
    {
        title: "Management",
        items: [
            { icon: Users, label: 'Customers', href: '/admin/customers' },
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

export function ModernSidebar() {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

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
                    "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-[var(--dashboard-background)] border-r border-[var(--dashboard-border)]",
                    "transition-transform duration-300 ease-in-out",
                    "md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--dashboard-accent-gold)] to-yellow-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            P
                        </div>
                        <span className="font-semibold text-lg text-[var(--dashboard-text)]">PrimeLux Admin</span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--dashboard-text-muted)]" />
                        <Input
                            placeholder="Search"
                            className="pl-9 bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] h-9 text-sm focus-visible:ring-[var(--dashboard-accent-gold)]"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
                    {sidebarGroups.map((group, groupIndex) => (
                        <div key={group.title}>
                            <h3 className="text-xs font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-2 px-2">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item, index) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors relative group",
                                                isActive
                                                    ? "bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)]"
                                                    : "text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)]"
                                            )}
                                        >
                                            <item.icon className={cn("h-4 w-4", isActive ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-text)]")} />
                                            <span>{item.label}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--dashboard-accent-gold)]"
                                                />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-[var(--dashboard-border)]">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--dashboard-card-hover)] cursor-pointer transition-colors group">
                        <div className="h-8 w-8 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text-muted)]">
                            <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--dashboard-text)] truncate">Admin User</p>
                            <p className="text-xs text-[var(--dashboard-text-muted)] truncate">admin@primelux.com</p>
                        </div>
                        <LogOut className="h-4 w-4 text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-text)]" />
                    </div>
                </div>
            </aside>
        </>
    )
}
