import { DashboardHeader } from '@/components/admin/dashboard/dashboard-header'
import { TasksCard } from '@/components/admin/dashboard/tasks-card'
import { MeetingsCard } from '@/components/admin/dashboard/meetings-card'
import { UpcomingOrdersCard } from '@/components/admin/dashboard/upcoming-orders-card'
import { AlertsCard } from '@/components/admin/dashboard/alerts-card'
import { RecentTemplates } from '@/components/admin/dashboard/recent-templates'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-8 p-8 bg-[#FDFBF7] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em]">Management Console</span>
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 font-light text-sm max-w-md">
                        Welcome back to PrimeLux. Here is a summary of your operations for today.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    System Online
                </div>
            </div>

            <DashboardHeader />

            {/* Main Content Grid */}
            <div className="grid gap-8 grid-cols-1 xl:grid-cols-12">
                {/* Left Column - Tasks & Meetings */}
                <div className="xl:col-span-4 flex flex-col gap-8">
                    <TasksCard />
                    <MeetingsCard />
                </div>

                {/* Right Column - Orders & Activity */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    <UpcomingOrdersCard />

                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                        <AlertsCard />
                        <RecentTemplates />
                    </div>
                </div>
            </div>
        </div>
    )
}
