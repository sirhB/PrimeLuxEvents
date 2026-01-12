'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    Package,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Archive,
    Layers,
    ClipboardList,
    Image as ImageIcon,
    CalendarCheck,
    ChevronRight,
    UserCog,
    CheckSquare,
    QrCode,
    Truck,
    TrendingUp,
    MessageSquare,
    Tag,
    Briefcase,
    Eye,
    Box
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAdminSidebar } from './sidebar-context'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarItemProps {
    item: {
        icon: React.ElementType
        label: string
        href: string
    }
    isActive: boolean
    isCollapsed: boolean
    onClick?: () => void
}

const SidebarItem = ({ item, isActive, isCollapsed, onClick }: SidebarItemProps) => {
    const Icon = item.icon

    const content = (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group overflow-hidden",
                isActive
                    ? "bg-[var(--dashboard-accent-gold)]/15 text-[var(--dashboard-accent-gold)] shadow-[inset_0_0_15px_rgba(212,175,55,0.1)]"
                    : "text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)]"
            )}
        >
            <Icon className={cn(
                "h-5 w-5 transition-transform duration-200 shrink-0 z-10",
                "group-hover:scale-110",
                isActive ? "text-[var(--dashboard-accent-gold)] scale-105" : "text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-text)]"
            )} />

            {!isCollapsed && (
                <span className={cn(
                    "truncate z-10 transition-all duration-200",
                    isActive && "font-semibold"
                )}>
                    {item.label}
                </span>
            )}

            {isActive && (
                <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[var(--dashboard-accent-gold)] shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 20 }}
                    exit={{ opacity: 0, height: 0 }}
                />
            )}

            {/* Subtle gloss effect on hover/active */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 transition-opacity duration-300",
                (isActive || (!isActive && "group-hover:opacity-100")) && "opacity-100"
            )} />
        </Link>
    )

    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[var(--dashboard-card)] text-[var(--dashboard-text)] border border-[var(--dashboard-border)] font-medium">
                    {item.label}
                </TooltipContent>
            </Tooltip>
        )
    }

    return content
}

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
            { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
            { icon: FileText, label: 'Leads', href: '/admin/consultations' },
            { icon: CalendarCheck, label: 'Appointments', href: '/admin/appointments' },
            { icon: Truck, label: 'Logistics', href: '/admin/logistics' },
            { icon: Briefcase, label: 'Bags', href: '/admin/bags' },
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
            { icon: Archive, label: 'Inventory', href: '/admin/inventory' },
            { icon: ImageIcon, label: 'Portfolio', href: '/admin/portfolio' },
            { icon: Box, label: 'Packages', href: '/admin/packages' },
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
        title: "Communications",
        items: [
            { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
        ]
    },
    {
        title: "Marketing",
        items: [
            { icon: Tag, label: 'Discounts', href: '/admin/marketing/discounts' },
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

    // Helper to determine if a route is active (handling nested routes)
    const isRouteActive = (href: string) => {
        if (href === '/admin' && pathname === '/admin') return true
        if (href !== '/admin' && pathname.startsWith(href)) return true
        return false
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <TooltipProvider>
            {/* Mobile Toggle Button (Fixed) */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-3 left-4 z-50 md:hidden text-[var(--dashboard-text)] bg-[var(--dashboard-card)]/50 backdrop-blur-md border border-[var(--dashboard-border)] shadow-sm"
                onClick={() => setIsMobileOpen(true)}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Mobile Backdrop Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    // Glassmorphism background
                    "bg-[var(--dashboard-background)]/95 backdrop-blur-xl border-r border-[var(--dashboard-border)]",
                    // Width logic
                    isCollapsed ? "w-20" : "w-64",
                    // Mobile slide-in logic
                    "md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                    // Shadow for depth
                    "shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]"
                )}
            >
                {/* Header Section */}
                <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-[var(--dashboard-border)]/50 shrink-0">
                    <div className={cn( // Logo container
                        "flex items-center gap-3 transition-opacity duration-300 overflow-hidden",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                    )}>
                        <div className="relative h-8 w-8 shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--dashboard-accent-gold)] to-yellow-600 rounded-lg blur-[2px] opacity-70" />
                            <div className="relative h-full w-full rounded-lg bg-gradient-to-br from-[var(--dashboard-accent-gold)] to-yellow-600 flex items-center justify-center text-white font-bold text-lg shadow-sm ring-1 ring-white/10">
                                P
                            </div>
                        </div>
                        <span className="font-semibold text-lg text-[var(--dashboard-text)] tracking-tight whitespace-nowrap">
                            PrimeLux
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "hidden md:flex text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)] transition-colors",
                            isCollapsed && "mx-auto"
                        )}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>

                    {/* Close button for mobile inside sidebar */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-[var(--dashboard-text-muted)]"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation Section */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[var(--dashboard-border)] scrollbar-track-transparent">
                    <nav className="p-3 space-y-6">
                        {sidebarGroups.map((group) => (
                            <div key={group.title} className="space-y-1">
                                {!isCollapsed && (
                                    <h3 className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-[0.2em] px-3 mb-2 opacity-70">
                                        {group.title}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <SidebarItem
                                            key={item.href}
                                            item={item}
                                            isActive={isRouteActive(item.href)}
                                            isCollapsed={isCollapsed}
                                            onClick={() => setIsMobileOpen(false)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Footer User Section */}
                <div className="p-3 border-t border-[var(--dashboard-border)]/50 bg-black/10 shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--dashboard-card-hover)] transition-all duration-200 group relative overflow-hidden outline-none",
                                isCollapsed ? "justify-center" : "justify-start"
                            )}>
                                <Avatar className="h-9 w-9 border border-white/10 shadow-inner">
                                    <AvatarFallback className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-[var(--dashboard-text-muted)]">
                                        <Users className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>

                                {!isCollapsed && (
                                    <>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-xs font-semibold text-[var(--dashboard-text)] truncate">
                                                {user?.user_metadata?.full_name || "Admin User"}
                                            </p>
                                            <p className="text-[10px] text-[var(--dashboard-text-muted)] truncate">
                                                administrator
                                            </p>
                                        </div>
                                        <Settings className="h-4 w-4 text-[var(--dashboard-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side={isCollapsed ? "right" : "top"} align={isCollapsed ? "start" : "center"} className="w-56 bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] backdrop-blur-xl">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />
                            <DropdownMenuItem className="focus:bg-[var(--dashboard-card-hover)] focus:text-[var(--dashboard-text)] cursor-pointer">
                                <UserCog className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-[var(--dashboard-card-hover)] focus:text-[var(--dashboard-text)] cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />
                            <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>
        </TooltipProvider>
    )
}
