"use client"

import { useRouter } from 'next/navigation'
import { PullToRefresh } from '@/components/admin/pull-to-refresh'
import { MetricsOverview } from '@/components/admin/dashboard/metrics-overview'
import { RevenueChartEnhanced } from '@/components/admin/dashboard/revenue-chart-enhanced'
import { ActivityFeed } from '@/components/admin/dashboard/activity-feed'
import { LaunchReadinessTracker } from '@/components/admin/dashboard/launch-readiness-tracker'
import { QuickActionsWidget } from '@/components/admin/dashboard/quick-actions-widget'

export function DashboardContent() {
  const router = useRouter()

  const handleRefresh = async () => {
    router.refresh()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex flex-col gap-5">
        <MetricsOverview />
        <LaunchReadinessTracker />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueChartEnhanced />
          </div>
          <div className="xl:col-span-1">
            <ActivityFeed />
          </div>
        </div>
        <QuickActionsWidget />
      </div>
    </PullToRefresh>
  )
}
