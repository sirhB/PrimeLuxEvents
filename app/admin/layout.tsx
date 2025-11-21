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
            <div className="print:hidden">
                <AdminSidebar />
            </div>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-8 print:p-0 print:block">
                <div className="flex flex-col gap-4 print:hidden">
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
