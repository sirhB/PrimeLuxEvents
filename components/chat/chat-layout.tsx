'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Search, Plus, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ChatWindow } from './chat-window'

interface Conversation {
    id: string
    type: 'support' | 'internal'
    subject?: string
    last_message_at: string
    participants: {
        user_id: string
        email: string // We'll need to join this
    }[]
}

interface ChatLayoutProps {
    currentUserEmail: string
    currentUserId: string
    isAdmin: boolean
}

export function ChatLayout({ currentUserEmail, currentUserId, isAdmin }: ChatLayoutProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        fetchConversations()

        // Subscribe to new messages/conversations
        const channel = supabase
            .channel('chat_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchConversations()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchConversations = async () => {
        // This is a complex query to get latest message and participants
        // For MVP, we might just fetch conversations and let RLS handle visibility
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                conversation_participants(user_id)
            `)
            .order('last_message_at', { ascending: false })

        if (data) {
            // Transform data if needed, or fetch participant details
            // For now, assume we have what we need or fetch details on select
            setConversations(data as any)
        }
        setIsLoading(false)
    }

    const createConversation = async () => {
        try {
            // Logic to create a new support thread
            const { data: newConv, error } = await supabase
                .from('conversations')
                .insert({ type: isAdmin ? 'internal' : 'support' }) // Default to internal for admins, support for users
                .select()
                .single()

            if (error) {
                console.error('Error creating conversation:', error)
                // If it's a permission error, maybe the table doesn't have the right policy
                return
            }

            if (newConv) {
                // Add self as participant
                const { error: participantError } = await supabase.from('conversation_participants').insert({
                    conversation_id: newConv.id,
                    user_id: currentUserId
                })

                if (participantError) {
                    console.error('Error adding participant:', participantError)
                }

                // If client, maybe add a default admin/support user automatically? 
                // Or wait for admin to join. For now, let's just create it.

                setSelectedId(newConv.id)
                fetchConversations()
            }
        } catch (err) {
            console.error('Unexpected error creating conversation:', err)
        }
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[var(--dashboard-card)] border-r border-[var(--dashboard-border)]">
            <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-[var(--dashboard-text)]">Messages</h2>
                <Button size="icon" variant="ghost" onClick={createConversation} className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)]" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 bg-[var(--dashboard-background)] border-none text-[var(--dashboard-text)] placeholder:text-[var(--dashboard-text-muted)] focus-visible:ring-[var(--dashboard-accent-gold)]"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => {
                                setSelectedId(conv.id)
                                setIsMobileOpen(false)
                            }}
                            className={cn(
                                "flex items-start gap-4 p-4 text-left rounded-xl transition-colors group",
                                selectedId === conv.id
                                    ? "bg-[var(--dashboard-accent-gold)]/10"
                                    : "hover:bg-[var(--dashboard-card-hover)]"
                            )}
                        >
                            <Avatar className="h-10 w-10 border border-[var(--dashboard-border)]">
                                <AvatarFallback className="bg-[var(--dashboard-background)] text-[var(--dashboard-text-muted)]">
                                    <MessageSquare className={cn(
                                        "h-5 w-5 transition-colors",
                                        selectedId === conv.id ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-text)]"
                                    )} />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={cn(
                                        "font-bold text-sm truncate transition-colors",
                                        selectedId === conv.id ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text)]"
                                    )}>
                                        {conv.subject || (conv.type === 'support' ? 'Support Ticket' : 'Internal Chat')}
                                    </span>
                                    <span className="text-[10px] text-[var(--dashboard-text-muted)] whitespace-nowrap">
                                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--dashboard-text-muted)] truncate group-hover:text-[var(--dashboard-text)] transition-colors">
                                    Click to view conversation
                                </p>
                            </div>
                        </button>
                    ))}
                    {conversations.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-[var(--dashboard-text-muted)] text-sm">
                            <p>No messages yet.</p>
                            <Button variant="link" onClick={createConversation} className="text-[var(--dashboard-accent-gold)]">Start a chat</Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )

    return (
        <div className="flex h-[calc(100vh-100px)] rounded-3xl overflow-hidden border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-2xl">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-80 lg:w-96">
                <SidebarContent />
            </div>

            {/* Mobile Sheet */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-0 w-80 border-r border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[var(--dashboard-background)]/50 backdrop-blur-xl">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-[var(--dashboard-border)] flex items-center gap-4 bg-[var(--dashboard-card)]">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="text-[var(--dashboard-text)]">
                        <Menu className="h-6 w-6" />
                    </Button>
                    <span className="font-bold text-[var(--dashboard-text)]">Messages</span>
                </div>

                {selectedId ? (
                    <ChatWindow conversationId={selectedId} currentUserId={currentUserId} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--dashboard-text-muted)] p-8 text-center">
                        <div className="h-20 w-20 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center mb-6">
                            <MessageSquare className="h-10 w-10 opacity-50" />
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-2 text-[var(--dashboard-text)]">Select a conversation</h3>
                        <p className="max-w-xs mx-auto text-sm opacity-70">
                            Choose a thread from the sidebar or start a new conversation to communicate with the team.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
