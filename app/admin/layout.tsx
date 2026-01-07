import { AdminSidebarProvider } from '@/components/admin/sidebar-context'
import { AdminLayoutContent } from '@/components/admin/layout-content'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminSidebarProvider>
            <AdminLayoutContent>
                {children}
            </AdminLayoutContent>
        </AdminSidebarProvider>
    )
}
