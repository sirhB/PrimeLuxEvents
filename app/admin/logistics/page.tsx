import dynamic from 'next/dynamic'
import { AdminPage } from '@/components/admin/page-shell'

const LogisticsContent = dynamic(
    () => import('@/components/admin/logistics/logistics-content').then(mod => mod.LogisticsContent)
)

export default function LogisticsPage() {
    return (
        <AdminPage>
            <LogisticsContent />
        </AdminPage>
    )
}
