import { ModernSidebar } from '@/components/admin/modern-sidebar'
import { AdminToastProvider } from '@/components/admin/toast-provider'
import { AdminSearchFab } from '@/components/admin/admin-search-fab'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full bg-[var(--dashboard-background)] text-[var(--dashboard-text)] font-sans">
            <div className="print:hidden">
                <ModernSidebar />
            </div>
            <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300">

                <main className="flex-1 p-4 md:p-8 pt-0 overflow-y-auto">
                    {children}
                </main>
            </div>
            <AdminToastProvider />
            <AdminSearchFab />
        </div>
    )
}
