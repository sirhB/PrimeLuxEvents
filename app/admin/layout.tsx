import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { AdminSidebarProvider } from '@/components/admin/sidebar-context'
import { AdminLayoutContent } from '@/components/admin/layout-content'
import { ReadinessProvider } from '@/components/admin/readiness-provider'
import { requireAdminRouteAccess } from '@/lib/auth/authorization'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  manifest: '/manifest-admin.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PrimeLux Admin',
  },
}

export const viewport = {
  themeColor: '#f7f5f1',
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const headerStore = await headers()
    const pathname = headerStore.get('x-pathname') || '/admin'
    await requireAdminRouteAccess(pathname)

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
