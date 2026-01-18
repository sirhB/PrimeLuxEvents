import { createClient } from '@/lib/supabase/server'
import { MessagesContent } from '@/components/chat/messages-content'
import { redirect } from 'next/navigation'

export default async function AdminMessagesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Support & Internal
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Messages
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Unified inbox for client support and team communication.
                    </p>
                </div>
            </div>

            <MessagesContent
                currentUserEmail={user.email || ''}
                currentUserId={user.id}
            />
        </div>
    )
}
