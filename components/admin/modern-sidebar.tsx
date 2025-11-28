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

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

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
            { icon: CalendarCheck, label: 'Events', href: '/admin/events' },
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
                    "fixed inset-y-0 left-0 z-40 w-64 flex flex-col relative overflow-hidden",
                    "bg-gradient-to-b from-card via-card to-secondary/30",
                    "border-r border-border/40 shadow-2xl shadow-black/5",
                    "backdrop-blur-sm",
                    "transition-transform duration-300 ease-in-out",
                    "md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Premium background effects */}
                <div className="absolute inset-0 bg-noise opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.02] via-transparent to-gold/[0.01]" />
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gold/[0.03] to-transparent" />
                {/* Header */}
                <div className="p-8 pb-6 border-b border-border/20">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-4 mb-8"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold via-yellow-500 to-gold flex items-center justify-center text-black font-serif font-bold text-xl shadow-lg shadow-gold/25"
                        >
                            P
                        </motion.div>
                        <div>
                            <h1 className="font-serif font-light text-xl text-foreground tracking-tight">PrimeLux</h1>
                            <p className="text-sm text-muted-foreground font-light">Admin Panel</p>
                        </div>
                    </motion.div>
                </div>



                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
                    {sidebarGroups.map((group, groupIndex) => (
                        <motion.div
                            key={group.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: groupIndex * 0.1 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium uppercase tracking-wider mb-4">
                                {group.title}
                            </div>
                            <div className="space-y-2">
                                {group.items.map((item, index) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <motion.div
                                            key={item.href}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                                        >
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group",
                                                    "hover:shadow-lg hover:shadow-gold/10",
                                                    isActive
                                                        ? "bg-gradient-to-r from-gold/20 to-gold/10 text-foreground border border-gold/30 shadow-md shadow-gold/20"
                                                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground hover:border hover:border-border/40"
                                                )}
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    className={cn(
                                                        "h-5 w-5 transition-colors duration-300",
                                                        isActive ? "text-gold" : "text-muted-foreground group-hover:text-gold"
                                                    )}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                </motion.div>
                                                <span className="font-light">{item.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeIndicator"
                                                        className="absolute right-4 w-2 h-2 rounded-full bg-gold shadow-lg shadow-gold/50"
                                                    />
                                                )}
                                            </Link>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-6 border-t border-border/20 bg-secondary/20 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/40 hover:border-gold/30 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:shadow-gold/10"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="h-10 w-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border-2 border-gold/30 flex items-center justify-center text-gold shadow-md shadow-gold/20"
                        >
                            <Users className="h-5 w-5" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate font-light">
                                {user?.user_metadata?.full_name || "Admin User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate font-light">
                                {user?.email || "admin@primelux.com"}
                            </p>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LogOut
                                className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors duration-300"
                                onClick={async () => {
                                    await supabase.auth.signOut()
                                    window.location.href = '/'
                                }}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </aside>


        </>
    )
}
