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
    Eye
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
    { icon: FileText, label: 'Consultations', href: '/admin/consultations' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: Layers, label: 'Categories', href: '/admin/categories' },
    { icon: Box, label: 'Inventory', href: '/admin/inventory' },
    { icon: ClipboardList, label: 'Pack Slip', href: '/admin/pack-slip' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: Eye, label: 'Visual Editor', href: '/admin/visual-editor' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
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
                    "fixed inset-y-0 left-0 z-40 w-20 flex flex-col items-center py-8 bg-[var(--dashboard-background)] border-r border-[var(--dashboard-border)]",
                    "transition-transform duration-300 ease-in-out",
                    "md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <motion.div
                    className="mb-8"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--dashboard-accent-gold)] to-yellow-600 flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-gold/20">
                        P
                    </div>
                </motion.div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href
                        return (
                            <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-transparent text-[var(--dashboard-accent-gold)]"
                                            : "text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)]"
                                    )}
                                    title={item.label}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <item.icon className={cn("h-6 w-6", isActive && "text-[var(--dashboard-accent-gold)]")} />
                                    </motion.div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--dashboard-accent-gold)] rounded-r-full"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            </motion.div>
                        )
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto flex flex-col gap-4 px-2">
                    <motion.button
                        className="flex flex-col items-center justify-center p-3 rounded-2xl text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)] transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <LogOut className="h-6 w-6" />
                    </motion.button>
                </div>
            </aside>
        </>
    )
}
