import { ActivityFeed } from '@/components/admin/activity-feed'
import { History } from 'lucide-react'

import { requirePermission } from '@/lib/auth/authorization'

export default async function GlobalActivityPage() {
    await requirePermission('settings.view')
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Governance
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-[var(--dashboard-text)] tracking-tight text-glow">
                        Audit & Activity
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Comprehensive log of all system changes and administrative actions.
                    </p>
                </div>
            </div>

            <div className="glass-card border-none rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[var(--dashboard-border)]">
                    <div className="h-12 w-12 rounded-2xl bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center border border-[var(--dashboard-accent-gold)]/20">
                        <History className="h-6 w-6 text-[var(--dashboard-accent-gold)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif text-[var(--dashboard-text)]">System-wide Feed</h2>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] uppercase tracking-widest font-bold">Real-time update stream</p>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <ActivityFeed limit={50} />
                </div>
            </div>
        </div>
    )
}
