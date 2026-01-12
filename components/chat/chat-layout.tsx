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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Conversation {
    id: string
    type: 'support' | 'internal'
    subject?: string
    last_message_at: string
    participants: {
        user_id: string
        email: string
    }[]
}

interface UserProfile {
    id: string
    full_name: string | null
    email: string
}

interface ChatLayoutProps {
    currentUserEmail: string
    currentUserId: string
    isAdmin: boolean
}

export function ChatLayout({ currentUserEmail, currentUserId, isAdmin }: ChatLayoutProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // New Chat State
    const [isNewChatOpen, setIsNewChatOpen] = useState(false)
    const [newChatType, setNewChatType] = useState<'support' | 'direct'>('support')
    const [recipientEmail, setRecipientEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [initialMessage, setInitialMessage] = useState('')
    const [isCreating, setIsCreating] = useState(false)

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
            setConversations(data as any)

            // Extract all user IDs from participants to fetch profiles
            const userIds = new Set<string>()
            data.forEach((conv: any) => {
                conv.conversation_participants?.forEach((p: any) => {
                    if (p.user_id !== currentUserId) {
                        userIds.add(p.user_id)
                    }
                })
            })

            if (userIds.size > 0) {
                const { data: profilesData } = await supabase
                    .from('user_profiles')
                    .select('id, full_name, email')
                    .in('id', Array.from(userIds))

                if (profilesData) {
                    const profileMap: Record<string, UserProfile> = {}
                    profilesData.forEach(p => {
                        profileMap[p.id] = p
                    })
                    setProfiles(profileMap)
                }
            }
        }
        setIsLoading(false)
    }

    const startNewChat = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        try {
            let participantIds: string[] = []

            // If direct message, resolve email to ID
            if (newChatType === 'direct') {
                if (!recipientEmail.trim()) {
                    toast.error('Please enter a recipient email')
                    setIsCreating(false)
                    return
                }

                // Cast response to allow 'id' access since RPC types might be loose
                const { data: userData, error: userError } = await supabase
                    .rpc('get_user_by_email', { email_input: recipientEmail.trim() })
                    .single<any>()

                if (userError || !userData) {
                    toast.error('User not found. Please check the email.')
                    setIsCreating(false)
                    return
                }
                participantIds = [userData.id]
            }

            // Create Conversation via RPC
            const { data: conversationId, error } = await supabase
                .rpc('create_new_conversation', {
                    p_type: newChatType === 'direct' ? 'internal' : 'support',
                    p_subject: subject.trim() || null,
                    p_message: initialMessage.trim() || null,
                    p_participant_ids: participantIds
                })

            if (error) {
                console.error('Error creating chat:', error)
                toast.error('Failed to create chat')
            } else if (conversationId) {
                setSelectedId(conversationId)
                fetchConversations()
                setIsNewChatOpen(false)
                // Reset form
                setRecipientEmail('')
                setSubject('')
                setInitialMessage('')
                setNewChatType('support')
            }

        } catch (err) {
            console.error('Unexpected error:', err)
            toast.error('An unexpected error occurred')
        } finally {
            setIsCreating(false)
        }
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[var(--dashboard-card)] border-r border-[var(--dashboard-border)]">
            <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-[var(--dashboard-text)]">Messages</h2>

                <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                        <DialogHeader>
                            <DialogTitle>New Message</DialogTitle>
                            <DialogDescription className="text-[var(--dashboard-text-muted)]">
                                Start a new conversation.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={startNewChat} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">To</Label>
                                <Select
                                    value={newChatType}
                                    onValueChange={(val: 'support' | 'direct') => setNewChatType(val)}
                                >
                                    <SelectTrigger className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)]">
                                        <SelectValue placeholder="Select recipient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="support">Support Team (Role)</SelectItem>
                                        <SelectItem value="direct">Specific Person (Email)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {newChatType === 'direct' && (
                                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="email">Recipient Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="user@example.com"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)]"
                                    />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Brief topic..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)]"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Type your message here..."
                                    value={initialMessage}
                                    onChange={(e) => setInitialMessage(e.target.value)}
                                    className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)] min-h-[100px]"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isCreating} className="bg-[var(--dashboard-accent-gold)] text-black hover:bg-[var(--dashboard-accent-gold)]/90">
                                    {isCreating ? 'Creating...' : 'Send Message'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
                                        {(() => {
                                            if (conv.subject) return conv.subject
                                            if (conv.type === 'support') return 'Support Ticket'

                                            // Find other participant for DM
                                            const otherUserId = conv.participants?.find((p: any) => p.user_id !== currentUserId)?.user_id
                                            const profile = otherUserId ? profiles[otherUserId] : null

                                            if (profile?.full_name) return profile.full_name
                                            if (profile?.email) return profile.email

                                            return 'Direct Message'
                                        })()}
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
                            <Button variant="link" onClick={() => setIsNewChatOpen(true)} className="text-[var(--dashboard-accent-gold)]">Start a chat</Button>
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
