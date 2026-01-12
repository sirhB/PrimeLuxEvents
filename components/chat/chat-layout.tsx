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
        // Logic to create a new support thread
        const { data: newConv, error } = await supabase
            .from('conversations')
            .insert({ type: isAdmin ? 'internal' : 'support' }) // Default to internal for admins, support for users
            .select()
            .single()

        if (newConv) {
            // Add self as participant
            await supabase.from('conversation_participants').insert({
                conversation_id: newConv.id,
                user_id: currentUserId
            })

            // If client, maybe add a default admin/support user automatically? 
            // Or wait for admin to join. For now, let's just create it.

            setSelectedId(newConv.id)
            fetchConversations()
        }
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-black/20 border-r border-border/10">
            <div className="p-4 border-b border-border/10 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold">Messages</h2>
                <Button size="icon" variant="ghost" onClick={createConversation}>
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search..." className="pl-9 bg-gray-50 dark:bg-white/5 border-none" />
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
                                "flex items-start gap-4 p-4 text-left rounded-xl transition-colors",
                                selectedId === conv.id
                                    ? "bg-[var(--dashboard-accent-gold)]/10"
                                    : "hover:bg-gray-100 dark:hover:bg-white/5"
                            )}
                        >
                            <Avatar className="h-10 w-10 border border-border/10">
                                <AvatarFallback><MessageSquare className="h-5 w-5 text-gray-400" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm truncate">
                                        {conv.subject || (conv.type === 'support' ? 'Support Ticket' : 'Internal Chat')}
                                    </span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                    Click to view conversation
                                </p>
                            </div>
                        </button>
                    ))}
                    {conversations.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            <p>No messages yet.</p>
                            <Button variant="link" onClick={createConversation}>Start a chat</Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )

    return (
        <div className="flex h-[calc(100vh-100px)] rounded-3xl overflow-hidden border border-border/10 bg-[var(--dashboard-background)] shadow-2xl">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-80 lg:w-96">
                <SidebarContent />
            </div>

            {/* Mobile Sheet */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-0 w-80">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white/50 dark:bg-black/40 backdrop-blur-xl">
                {/* Mobile Header */}
                <div className="md:hidden p-4 border-b border-border/10 flex items-center gap-4 bg-white/80 dark:bg-black/80 backdrop-blur">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    <span className="font-bold">Messages</span>
                </div>

                {selectedId ? (
                    <ChatWindow conversationId={selectedId} currentUserId={currentUserId} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                        <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6">
                            <MessageSquare className="h-10 w-10 opacity-50" />
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-2">Select a conversation</h3>
                        <p className="max-w-xs mx-auto text-sm opacity-70">
                            Choose a thread from the sidebar or start a new conversation to communicate with the team.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
