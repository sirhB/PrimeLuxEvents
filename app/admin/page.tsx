import { DashboardHeader } from '@/components/admin/dashboard/dashboard-header'
import { TasksCard } from '@/components/admin/dashboard/tasks-card'
import { MeetingsCard } from '@/components/admin/dashboard/meetings-card'
import { ProjectsWorkedCard } from '@/components/admin/dashboard/projects-worked-card'
import { UpcomingEvents } from '@/components/admin/dashboard/upcoming-events'
import { AlertsCard } from '@/components/admin/dashboard/alerts-card'
import { RecentTemplates } from '@/components/admin/dashboard/recent-templates'

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1 text-sm">
                    Welcome back! Here's what's happening today.
                </p>
            </div>

            <DashboardHeader />

            {/* Row 1 */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-4 h-full">
                    <TasksCard />
                </div>
                <div className="md:col-span-4 h-full">
                    <MeetingsCard />
                </div>
                <div className="md:col-span-4 h-full">
                    <ProjectsWorkedCard />
                </div>
            </div>

            {/* Row 2 */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-8 h-full">
                    <UpcomingEvents />
                </div>
                <div className="md:col-span-4 h-full">
                    <AlertsCard />
                </div>
            </div>

            {/* Row 3 */}
            <div className="grid gap-6 grid-cols-1">
                <RecentTemplates />
            </div>
        </div>
    )
}
