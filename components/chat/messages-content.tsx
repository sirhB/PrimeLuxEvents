'use client'

import nextDynamic from 'next/dynamic'

const ChatLayout = nextDynamic(() => import('@/components/chat/chat-layout').then(m => m.ChatLayout), {
    loading: () => <div className="h-[600px] w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})

export function MessagesContent({ currentUserEmail, currentUserId }: { currentUserEmail: string, currentUserId: string }) {
    return (
        <ChatLayout
            currentUserEmail={currentUserEmail}
            currentUserId={currentUserId}
            isAdmin={true}
        />
    )
}
