'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Paperclip, Loader2, Archive, ArrowLeft, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { aiService } from '@/lib/ai/puter'

interface Message {
    id: string
    content: string
    sender_id: string | null
    is_ai: boolean
    created_at: string
    sender?: {
        full_name: string | null
        avatar_url: string | null
        email: string
    }
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
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [senderProfiles, setSenderProfiles] = useState<Record<string, any>>({})
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
                    // If it's a new message, we might need to fetch the sender profile if we don't have it
                    if (newMsg.sender_id && !senderProfiles[newMsg.sender_id]) {
                        fetchSenderProfile(newMsg.sender_id)
                    }
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
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:user_profiles!messages_sender_id_profile_fkey (
                    full_name,
                    avatar_url,
                    email
                )
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching messages:', error)
            // Fallback to simple fetch if join fails
            const { data: simpleData } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })
            if (simpleData) setMessages(simpleData)
        } else if (data) {
            setMessages(data as any)
        }
        setIsLoading(false)
        scrollToBottom()
    }

    const fetchSenderProfile = async (userId: string) => {
        const { data } = await supabase
            .from('user_profiles')
            .select('full_name, avatar_url, email')
            .eq('id', userId)
            .single()

        if (data) {
            setSenderProfiles(prev => ({ ...prev, [userId]: data }))
        }
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

    const handleConsultSensei = async () => {
        if (isGeneratingAI) return

        // Check if authenticated with Puter
        const signedIn = await aiService.isSignedIn()
        if (!signedIn) {
            const user = await aiService.signIn()
            if (!user) {
                toast.error("Please sign in with Puter to consult the Sensei.")
                return
            }
        }

        setIsGeneratingAI(true)
        try {
            // Get recent context (last 10 messages)
            const context = messages.slice(-10).map(m => ({
                content: m.content,
                role: (m.sender_id === currentUserId ? 'user' : 'assistant') as 'user' | 'assistant'
            }))

            const aiResponse = await aiService.getChatResponse(context)

            if (aiResponse) {
                const { data, error } = await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversationId,
                        sender_id: null,
                        is_ai: true,
                        content: aiResponse
                    })
                    .select()
                    .single()

                if (error) throw error

                if (data) {
                    setMessages(prev => {
                        const newMsg = data as unknown as Message
                        if (prev.some(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                    scrollToBottom()
                }
            }
        } catch (err) {
            console.error('Error getting Sensei response:', err)
            toast.error('The Sensei is currently reflecting and couldn\'t answer.')
        } finally {
            setIsGeneratingAI(false)
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
                            const sender = msg.sender || (msg.sender_id ? senderProfiles[msg.sender_id] : null)
                            const showTimeDivider = i === 0 || new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 1000 * 60 * 30 // 30 mins
                            // Show sender name if: Not me AND (first message OR sender changed OR status (AI/Human) changed)
                            const showSenderName = !isMe && (i === 0 || messages[i - 1].sender_id !== msg.sender_id || messages[i - 1].is_ai !== msg.is_ai)

                            return (
                                <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                    {showTimeDivider && (
                                        <div className="text-[10px] text-[var(--dashboard-text-muted)] uppercase tracking-widest my-4 text-center w-full opacity-50">
                                            {format(new Date(msg.created_at), 'MMMM d, h:mm a')}
                                        </div>
                                    )}

                                    <div className={cn(
                                        "flex gap-2 max-w-[85%]",
                                        isMe ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        {!isMe && (
                                            <div className="mt-1 shrink-0">
                                                <div className="h-8 w-8 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center overflow-hidden">
                                                    {sender?.avatar_url ? (
                                                        <img src={sender.avatar_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-[var(--dashboard-text-muted)]">
                                                            {(sender?.full_name || sender?.email || 'U').charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                            {showSenderName && (
                                                <span className="text-[10px] font-bold text-[var(--dashboard-text-muted)] mb-1 ml-1 uppercase tracking-tight">
                                                    {msg.is_ai ? 'The Sensei' : (sender?.full_name || sender?.email || 'Unknown User')}
                                                </span>
                                            )}

                                            <div
                                                className={cn(
                                                    "rounded-2xl px-4 py-2.5 shadow-sm group relative",
                                                    isMe
                                                        ? "bg-[var(--dashboard-accent-gold)] text-black rounded-tr-sm"
                                                        : msg.is_ai
                                                            ? "bg-gradient-to-br from-gold/20 to-amber-900/40 text-gold border border-gold/30 rounded-tl-sm backdrop-blur-md"
                                                            : "bg-[var(--dashboard-card)] text-[var(--dashboard-text)] rounded-tl-sm border border-[var(--dashboard-border)]"
                                                )}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                                {/* Timestamp in bubble or below */}
                                                <div className={cn(
                                                    "text-[9px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                                                    isMe ? "text-black/60" : "text-[var(--dashboard-text-muted)]"
                                                )}>
                                                    {format(new Date(msg.created_at), 'h:mm a')}
                                                </div>
                                            </div>
                                        </div>
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
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleConsultSensei}
                        disabled={isGeneratingAI || isArchived}
                        className="rounded-full text-[var(--dashboard-accent-gold)] hover:bg-gold/10"
                        title="Consult the Sensei (AI)"
                    >
                        {isGeneratingAI ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
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
