'use client'

import { useAdminSidebar } from '@/components/admin/sidebar-context'
import { ModernSidebar } from '@/components/admin/modern-sidebar'
import { AdminToastProvider } from '@/components/admin/toast-provider'
import { AdminSearchFab } from '@/components/admin/admin-search-fab'
import { AdminNotifications } from '@/components/admin/notifications'
import { cn } from '@/lib/utils'
import { Search, User } from 'lucide-react'

export function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useAdminSidebar()

    return (
        <div className="flex min-h-screen w-full bg-[var(--dashboard-background)] text-[var(--dashboard-text)] font-sans admin-theme">
            <div className="print:hidden">
                <ModernSidebar />
            </div>
            <div className={cn(
                "flex flex-1 flex-col transition-all duration-300",
                isCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                {/* Admin Header / Top Bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/80 backdrop-blur-md px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)]" />
                            <input
                                type="text"
                                placeholder="Search platform..."
                                className="w-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-[var(--dashboard-accent-gold)] focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <AdminNotifications />
                        <div className="h-8 w-px bg-[var(--dashboard-border)] mx-1" />
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-bold text-[var(--dashboard-text)] leading-none mb-1">Admin Panel</p>
                                <p className="text-[10px] text-[var(--dashboard-text-muted)] uppercase tracking-wider">Live System</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text-muted)]">
                                <User className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
            <AdminToastProvider />
            <AdminSearchFab />
        </div>
    )
}
