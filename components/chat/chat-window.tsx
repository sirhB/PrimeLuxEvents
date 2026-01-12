'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Paperclip, Loader2, Archive, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Message {
    id: string
    content: string
    sender_id: string
    created_at: string
}

interface ChatWindowProps {
    conversationId: string
    currentUserId: string
    title: string
    isArchived: boolean
    onArchive: () => void
}

export function ChatWindow({ conversationId, currentUserId, title, isArchived, onArchive }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchMessages()

        const channel = supabase
            .channel(`conversation:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        // Prevent duplicates if we already added it manually
                        if (prev.some(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                    scrollToBottom()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId])

    const fetchMessages = async () => {
        setIsLoading(true)
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (data) setMessages(data)
        setIsLoading(false)
        scrollToBottom()
    }

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        }, 100)
    }

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        try {
            // Optimistic update - wait for server confirmation to be safe with IDs
            // but we use select() to get the proper data back
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: currentUserId,
                    content: newMessage.trim()
                })
                .select()
                .single()

            if (error) {
                toast.error('Failed to send message')
                console.error(error)
            } else if (data) {
                setNewMessage('')
                // Manually add to state if not already there (race condition with subscription)
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev
                    return [...prev, data]
                })
                scrollToBottom()
            }
        } catch (err) {
            console.error('Error sending message:', err)
            toast.error('Failed to send message')
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="h-16 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-card)]/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-[var(--dashboard-text)] text-lg">
                        {title}
                    </h2>
                    {isArchived && (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            Archived
                        </span>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onArchive}
                    className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-card-hover)]"
                >
                    <Archive className="h-4 w-4 mr-2" />
                    {isArchived ? 'Unarchive' : 'Archive'}
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto pb-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-[var(--dashboard-text-muted)]" />
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_id === currentUserId
                            const showTime = i === 0 || new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 1000 * 60 * 5 // 5 mins

                            return (
                                <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                    {showTime && (
                                        <div className="text-[10px] text-[var(--dashboard-text-muted)] uppercase tracking-widest my-2 text-center w-full">
                                            {format(new Date(msg.created_at), 'h:mm a')}
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-2xl px-5 py-3 shadow-sm",
                                            isMe
                                                ? "bg-[var(--dashboard-accent-gold)] text-black rounded-tr-sm"
                                                : "bg-[var(--dashboard-card)] text-[var(--dashboard-text)] rounded-tl-sm border border-[var(--dashboard-border)]"
                                        )}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 bg-[var(--dashboard-background)]/80 border-t border-[var(--dashboard-border)] backdrop-blur-md">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3 items-end">
                    <Button type="button" size="icon" variant="ghost" className="rounded-full text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-card-hover)]">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 relative">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isArchived ? "Conversation is archived" : "Type a message..."}
                            disabled={isArchived}
                            className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] placeholder:text-[var(--dashboard-text-muted)] rounded-2xl pr-12 h-12 py-3 shadow-inner focus-visible:ring-1 focus-visible:ring-[var(--dashboard-accent-gold)] disabled:opacity-50"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSending || isArchived}
                        className="h-12 w-12 rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black shadow-lg hover:scale-105 transition-transform p-0 flex items-center justify-center disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
                    </Button>
                </form>
            </div>
        </div>
    )
}
