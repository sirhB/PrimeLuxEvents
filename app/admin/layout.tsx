import { ModernSidebar } from '@/components/admin/modern-sidebar'
import { AdminToastProvider } from '@/components/admin/toast-provider'
import { AdminSearchFab } from '@/components/admin/admin-search-fab'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full bg-gradient-to-br from-secondary/20 via-background to-secondary/10 text-foreground font-sans relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-noise opacity-40" />

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

            {/* Premium light rays effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.02] via-transparent to-gold/[0.01] pointer-events-none" />

            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />

            <div className="print:hidden relative z-10">
                <ModernSidebar />
            </div>
            <div className="flex flex-1 flex-col md:pl-64 transition-all duration-500 relative z-10">
                <main className="flex-1 py-8 md:py-12 px-6 md:px-8 overflow-y-auto">
                    <div className="container mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
            <AdminToastProvider />
            <AdminSearchFab />
        </div>
    )
}
