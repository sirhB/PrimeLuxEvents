import dynamic from 'next/dynamic'

const LogisticsContent = dynamic(
    () => import('@/components/admin/logistics/logistics-content').then(mod => mod.LogisticsContent)
)

export default function LogisticsPage() {
    return (
        <div className="p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <LogisticsContent />
        </div>
    )
}
