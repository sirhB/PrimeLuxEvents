'use client'

import { useAdminSidebar } from '@/components/admin/sidebar-context'
import { ModernSidebar } from '@/components/admin/modern-sidebar'
import { AdminToastProvider } from '@/components/admin/toast-provider'
import { AdminSearchFab } from '@/components/admin/admin-search-fab'
import { cn } from '@/lib/utils'

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
                <main className="flex-1 p-4 md:p-8 pt-0 overflow-y-auto">
                    {children}
                </main>
            </div>
            <AdminToastProvider />
            <AdminSearchFab />
        </div>
    )
}
