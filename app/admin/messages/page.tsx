import { createClient } from '@/lib/supabase/server'
import { MessagesContent } from '@/components/chat/messages-content'
import { redirect } from 'next/navigation'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function AdminMessagesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Support"
                title="Messages"
                description="Unified inbox for client support and team communication."
            />

            <MessagesContent
                currentUserEmail={user.email || ''}
                currentUserId={user.id}
            />
        </AdminPage>
    )
}
