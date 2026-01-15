import { Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import nextDynamic from 'next/dynamic'

const MetricsOverview = nextDynamic(() => import('@/components/admin/dashboard/metrics-overview').then(m => m.MetricsOverview), {
    loading: () => <div className="h-32 w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />
})
const RevenueChartEnhanced = nextDynamic(() => import('@/components/admin/dashboard/revenue-chart-enhanced').then(m => m.RevenueChartEnhanced), {
    loading: () => <div className="h-[400px] w-full flex items-center justify-center bg-[var(--dashboard-card)] rounded-3xl"><Loader2 className="h-8 w-8 animate-spin text-[var(--dashboard-accent-gold)]" /></div>
})
const ActivityFeed = nextDynamic(() => import('@/components/admin/dashboard/activity-feed').then(m => m.ActivityFeed), {
    loading: () => <div className="h-[400px] w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />
})
const LaunchReadinessTracker = nextDynamic(() => import('@/components/admin/dashboard/launch-readiness-tracker').then(m => m.LaunchReadinessTracker), {
    loading: () => <div className="h-24 w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />
})
const QuickActionsWidget = nextDynamic(() => import('@/components/admin/dashboard/quick-actions-widget').then(m => m.QuickActionsWidget), {
    loading: () => <div className="h-24 w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />
})
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 lg:p-10 bg-[var(--dashboard-background)] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Management Console
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs font-medium text-[var(--dashboard-text-muted)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--dashboard-accent-green)] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            Live
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-lg max-w-2xl">
                        Welcome back. Here's what's happening with your events today.
                    </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/orders/new">
                        <Button className="bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black rounded-2xl h-12 px-6 shadow-lg shadow-[var(--dashboard-accent-gold)]/20 transition-all duration-300 hover:scale-105 active:scale-95">
                            <Plus className="h-5 w-5 mr-2" />
                            <span className="font-bold uppercase tracking-wider text-xs">New Order</span>
                        </Button>
                    </Link>
                </div>
            </div>

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
        </div>
    )
}
