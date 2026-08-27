import type { Metadata } from 'next'
import { AdminSidebarProvider } from '@/components/admin/sidebar-context'
import { AdminLayoutContent } from '@/components/admin/layout-content'
import { ReadinessProvider } from '@/components/admin/readiness-provider'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  manifest: '/manifest-admin.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PrimeLux Admin',
  },
  themeColor: '#0a0a0b',
}

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
