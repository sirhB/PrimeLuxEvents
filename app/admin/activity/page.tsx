import { ActivityFeed } from '@/components/admin/activity-feed'
import { History } from 'lucide-react'

import { requirePermission } from '@/lib/auth/authorization'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function GlobalActivityPage() {
    await requirePermission('settings.view')
    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Governance"
                title="Audit & Activity"
                description="Comprehensive log of all system changes and administrative actions."
            />

            <div className="glass-card border-none rounded-[var(--dashboard-radius)] p-6 md:p-8 overflow-hidden">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[var(--dashboard-border)]">
                    <div className="h-10 w-10 rounded-md bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center border border-[var(--dashboard-accent-gold)]/20">
                        <History className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-[var(--dashboard-text)]">System-wide Feed</h2>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] uppercase tracking-widest font-bold">Real-time update stream</p>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <ActivityFeed limit={50} />
                </div>
            </div>
        </AdminPage>
    )
}
