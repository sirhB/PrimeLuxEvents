import { loadOpsIntelligence } from '@/lib/admin/ops-intelligence'
import { OpsIntelligenceDashboard } from '@/components/admin/analytics/ops-intelligence-dashboard'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const params = await searchParams
  const parsed = Number.parseInt(params.days || '30', 10)
  const rangeDays = Number.isFinite(parsed) ? parsed : 30
  const metrics = await loadOpsIntelligence(rangeDays)

  return <OpsIntelligenceDashboard metrics={metrics} />
}
