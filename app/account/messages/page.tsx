import { createClient } from '@/lib/supabase/server'
import { ChatLayout } from '@/components/chat/chat-layout'
import { redirect } from 'next/navigation'

export default async function MessagesPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/account/messages')
    }

    // Determine if admin (naive check for now, can be improved with roles table)
    // For client portal, we force isAdmin=false, but checking role is good practice
    // Here we just pass false since this is the CLIENT view

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-100px)]">
            <div className="mb-6">
                <h1 className="text-3xl font-serif font-light text-[var(--dashboard-text)]">
                    Support Messages
                </h1>
                <p className="text-[var(--dashboard-text-muted)] font-light">
                    Chat directly with our team for any questions or requests.
                </p>
            </div>

            <ChatLayout
                currentUserEmail={user.email || ''}
                currentUserId={user.id}
                isAdmin={false}
            />
        </div>
    )
}
