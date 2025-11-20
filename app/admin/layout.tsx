import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminSearch } from '@/components/admin-search'
import { AdminBreadcrumb } from '@/components/admin/breadcrumb'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full">
            <AdminSidebar />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <AdminBreadcrumb />
                        <AdminSearch />
                    </div>
                </div>
                {children}
            </main>
        </div>
    )
}
