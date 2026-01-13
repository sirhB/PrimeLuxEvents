import { AdminSidebarProvider } from '@/components/admin/sidebar-context'
import { AdminLayoutContent } from '@/components/admin/layout-content'
import { ReadinessProvider } from '@/components/admin/readiness-provider'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminSidebarProvider>
            <ReadinessProvider>
                <AdminLayoutContent>
                    {children}
                </AdminLayoutContent>
            </ReadinessProvider>
        </AdminSidebarProvider>
    )
}
