import { DashboardHeader } from '@/components/admin/dashboard/dashboard-header'
import { TasksCard } from '@/components/admin/dashboard/tasks-card'
import { MeetingsCard } from '@/components/admin/dashboard/meetings-card'
import { UpcomingOrdersCard } from '@/components/admin/dashboard/upcoming-orders-card'
import { AlertsCard } from '@/components/admin/dashboard/alerts-card'
import { RecentActivityList } from '@/components/admin/dashboard/recent-activity-list'
import { RevenueMiniChart } from '@/components/admin/dashboard/revenue-mini-chart'
import { SetupChecklist } from '@/components/admin/dashboard/setup-checklist'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch recent orders for RecentActivityList
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Management Console
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Welcome back to PrimeLux. Here is a summary of your operations for today.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full glass-card text-sm font-medium text-[var(--dashboard-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--dashboard-accent-green)] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    System Online
                </div>
            </div>

            <DashboardHeader />

            {/* Setup Checklist - Only shows if not complete */}
            <SetupChecklist />

            {/* Main Content Grid */}
            <div className="grid gap-8 grid-cols-1 xl:grid-cols-12">
                {/* Left Column - Tasks & Meetings */}
                <div className="xl:col-span-4 flex flex-col gap-8">
                    <div id="admin-revenue">
                        <RevenueMiniChart />
                    </div>
                    <div id="admin-tasks">
                        <TasksCard />
                    </div>
                    <MeetingsCard />
                </div>

                {/* Right Column - Orders & Activity */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    <UpcomingOrdersCard />

                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                        <AlertsCard />
                        <RecentActivityList orders={recentOrders || []} />
                    </div>
                </div>
            </div>
        </div>
    )
}
