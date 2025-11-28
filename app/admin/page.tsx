'use client'

import { motion } from 'framer-motion'
import { QuickActionsBar } from '@/components/admin/dashboard/quick-actions-bar'
import { TasksCard } from '@/components/admin/dashboard/tasks-card'
import { MeetingsCard } from '@/components/admin/dashboard/meetings-card'
import { ProjectsWorkedCard } from '@/components/admin/dashboard/projects-worked-card'
import { UpcomingEvents } from '@/components/admin/dashboard/upcoming-events'
import { AlertsCard } from '@/components/admin/dashboard/alerts-card'
import { RecentTemplates } from '@/components/admin/dashboard/recent-templates'

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col space-y-8">
            {/* Quick Actions Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="py-8"
            >
                <QuickActionsBar />
            </motion.section>

            {/* Dashboard Metrics Row */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="py-8"
            >
                <div className="grid gap-8 grid-cols-1 md:grid-cols-12">
                    <motion.div
                        className="md:col-span-4"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <TasksCard />
                    </motion.div>
                    <motion.div
                        className="md:col-span-4"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <MeetingsCard />
                    </motion.div>
                    <motion.div
                        className="md:col-span-4"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <ProjectsWorkedCard />
                    </motion.div>
                </div>
            </motion.section>

            {/* Events and Alerts Row */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="py-8"
            >
                <div className="grid gap-8 grid-cols-1 md:grid-cols-12">
                    <motion.div
                        className="md:col-span-8"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <UpcomingEvents />
                    </motion.div>
                    <motion.div
                        className="md:col-span-4"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <AlertsCard />
                    </motion.div>
                </div>
            </motion.section>

            {/* Templates Section */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="py-8"
            >
                <div className="grid gap-8 grid-cols-1">
                    <RecentTemplates />
                </div>
            </motion.section>
        </div>
    )
}
