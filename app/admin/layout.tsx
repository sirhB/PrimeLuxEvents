import { ModernSidebar } from '@/components/admin/modern-sidebar'
import { ModernHeader } from '@/components/admin/modern-header'

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
            <div className="flex flex-1 flex-col md:pl-20 transition-all duration-300">
                <ModernHeader />
                <main className="flex-1 p-4 md:p-8 pt-0 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
