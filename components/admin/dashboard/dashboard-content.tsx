"use client"

import { Loader2 } from 'lucide-react'
import nextDynamic from 'next/dynamic'

const MetricsOverview = nextDynamic(() => import('@/components/admin/dashboard/metrics-overview').then(m => m.MetricsOverview), {
    loading: () => <div className="h-32 w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})
const RevenueChartEnhanced = nextDynamic(() => import('@/components/admin/dashboard/revenue-chart-enhanced').then(m => m.RevenueChartEnhanced), {
    loading: () => <div className="h-[400px] w-full flex items-center justify-center bg-[var(--dashboard-card)] rounded-3xl"><Loader2 className="h-8 w-8 animate-spin text-[var(--dashboard-accent-gold)]" /></div>,
    ssr: false
})
const ActivityFeed = nextDynamic(() => import('@/components/admin/dashboard/activity-feed').then(m => m.ActivityFeed), {
    loading: () => <div className="h-[400px] w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})
const LaunchReadinessTracker = nextDynamic(() => import('@/components/admin/dashboard/launch-readiness-tracker').then(m => m.LaunchReadinessTracker), {
    loading: () => <div className="h-24 w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})
const QuickActionsWidget = nextDynamic(() => import('@/components/admin/dashboard/quick-actions-widget').then(m => m.QuickActionsWidget), {
    loading: () => <div className="h-24 w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})

export function DashboardContent() {
    return (
        <>
            {/* Metrics Overview */}
            <MetricsOverview />

            {/* Launch Readiness Tracker */}
            <LaunchReadinessTracker />

            {/* Main Content - 2 Column Layout */}
            <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
                {/* Left Column - Revenue Chart (2/3 width) */}
                <div className="xl:col-span-2">
                    <RevenueChartEnhanced />
                </div>

                {/* Right Column - Activity Feed (1/3 width) */}
                <div className="xl:col-span-1">
                    <ActivityFeed />
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActionsWidget />
        </>
    )
}
