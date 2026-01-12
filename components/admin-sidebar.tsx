'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Package, FolderTree, ShoppingCart, FileText, LogOut, Users,
    Calendar, Settings, CalendarCheck, Shield, BarChart3, MessageSquare,
    CheckSquare, Image, Truck, MapPin, QrCode, Warehouse, Palette, Megaphone,
    PackageOpen, ChevronDown, ChevronRight, Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'

interface SidebarItem {
    title: string
    href: string
    icon: any
}

interface SidebarSection {
    title: string
    items: SidebarItem[]
    defaultOpen?: boolean
}

const sidebarSections: SidebarSection[] = [
    {
        title: 'Overview',
        defaultOpen: true,
        items: [
            {
                title: 'Dashboard',
                href: '/admin',
                icon: LayoutDashboard,
            },
            {
                title: 'Analytics',
                href: '/admin/analytics',
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Catalog',
        defaultOpen: true,
        items: [
            {
                title: 'Products',
                href: '/admin/products',
                icon: Package,
            },
            {
                title: 'Categories',
                href: '/admin/categories',
                icon: FolderTree,
            },
            {
                title: 'Packages',
                href: '/admin/packages',
                icon: PackageOpen,
            },
            {
                title: 'Portfolio',
                href: '/admin/portfolio',
                icon: Image,
            },
        ],
    },
    {
        title: 'Sales',
        defaultOpen: true,
        items: [
            {
                title: 'Orders',
                href: '/admin/orders',
                icon: ShoppingCart,
            },
            {
                title: 'Leads',
                href: '/admin/consultations',
                icon: FileText,
            },
            {
                title: 'Appointments',
                href: '/admin/appointments',
                icon: CalendarCheck,
            },
        ],
    },
    {
        title: 'Operations',
        defaultOpen: false,
        items: [
            {
                title: 'Inventory',
                href: '/admin/inventory',
                icon: Calendar,
            },
            {
                title: 'Warehouse',
                href: '/admin/warehouse',
                icon: Warehouse,
            },
            {
                title: 'Bags',
                href: '/admin/bags',
                icon: PackageOpen,
            },
            {
                title: 'Delivery',
                href: '/admin/delivery',
                icon: Truck,
            },
            {
                title: 'Logistics',
                href: '/admin/logistics',
                icon: MapPin,
            },
            {
                title: 'Scanner',
                href: '/admin/scan',
                icon: QrCode,
            },
        ],
    },
    {
        title: 'Communication',
        defaultOpen: false,
        items: [
            {
                title: 'Messages',
                href: '/admin/messages',
                icon: MessageSquare,
            },
            {
                title: 'Tasks',
                href: '/admin/tasks',
                icon: CheckSquare,
            },
        ],
    },
    {
        title: 'People',
        defaultOpen: false,
        items: [
            {
                title: 'Customers',
                href: '/admin/customers',
                icon: Users,
            },
            {
                title: 'Team',
                href: '/admin/team',
                icon: Shield,
            },
        ],
    },
    {
        title: 'Site',
        defaultOpen: false,
        items: [
            {
                title: 'Content',
                href: '/admin/content',
                icon: FileText,
            },
            {
                title: 'Visual Editor',
                href: '/admin/visual-editor',
                icon: Palette,
            },
            {
                title: 'Marketing',
                href: '/admin/marketing',
                icon: Megaphone,
            },
        ],
    },
    {
        title: 'System',
        defaultOpen: false,
        items: [
            {
                title: 'Settings',
                href: '/admin/settings',
                icon: Settings,
            },
        ],
    },
]

function SidebarSectionComponent({ section, pathname }: { section: SidebarSection; pathname: string }) {
    const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false)

    // Check if any item in this section is active
    const hasActiveItem = section.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))

    return (
        <div className="mb-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-sidebar-foreground transition-colors uppercase tracking-wider"
            >
                <span>{section.title}</span>
                {isOpen ? (
                    <ChevronDown className="h-3 w-3" />
                ) : (
                    <ChevronRight className="h-3 w-3" />
                )}
            </button>
            {isOpen && (
                <div className="space-y-0.5 mt-1">
                    {section.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 text-sm',
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-semibold translate-x-1'
                                        : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 hover:translate-x-1'
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.title}
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Error signing out')
            return
        }
        router.push('/login')
        router.refresh()
    }

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
            <div className="flex h-14 items-center border-b border-sidebar-border px-6">
                <Link className="flex items-center gap-2 font-serif font-semibold tracking-wide text-lg" href="/admin">
                    <span className="">PrimeLux Admin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="px-2 space-y-2">
                    {sidebarSections.map((section) => (
                        <SidebarSectionComponent
                            key={section.title}
                            section={section}
                            pathname={pathname}
                        />
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t border-sidebar-border">
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
