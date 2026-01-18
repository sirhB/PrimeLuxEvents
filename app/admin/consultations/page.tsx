import { createClient } from '@/lib/supabase/server'
import { ConsultationsContent } from '@/components/admin/consultations/consultations-content'
import { type Consultation } from '@/components/admin/consultations/types'

export const dynamic = 'force-dynamic'

export default async function ConsultationsPage() {
    const supabase = await createClient()

    const { data } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })

    const leads = (data ?? []) as Consultation[]

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 bg-[var(--dashboard-background)]">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--dashboard-border)]">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20 shadow-sm">
                            Premium CRM
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-medium text-[var(--dashboard-text)] tracking-tight">
                        Lead Workspace
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-lg">
                        High-touch management for your event inquiries. Focus on the details that matter.
                    </p>
                </div>
            </header>

            {/* Immersive Workspace */}
            <ConsultationsContent leads={leads} />
        </div>
    )
}
