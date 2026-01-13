'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Search, Plus, MessageSquare, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ChatWindow } from './chat-window'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
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
    target_role_id?: string
    participants: {
        user_id: string
        email: string
    }[]
    lastMessagePreview?: string
    is_archived?: boolean
}

interface UserProfile {
    id: string
    full_name: string | null
    email: string
}

interface Role {
    id: string
    name: string
    display_name: string
}

interface ChatLayoutProps {
    currentUserEmail: string
    currentUserId: string
    isAdmin: boolean
}

export function ChatLayout({ currentUserEmail, currentUserId, isAdmin }: ChatLayoutProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})
    const [roles, setRoles] = useState<Role[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

    // New Chat State
    const [isNewChatOpen, setIsNewChatOpen] = useState(false)
    const [newChatType, setNewChatType] = useState<'role' | 'direct'>('role')
    const [selectedRoleId, setSelectedRoleId] = useState<string>('')
    const [recipientEmail, setRecipientEmail] = useState('') // Still used for non-search fallback or visual
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
    const [userSearchOpen, setUserSearchOpen] = useState(false)
    const [userSearchResults, setUserSearchResults] = useState<UserProfile[]>([])
    const [isSearchingUsers, setIsSearchingUsers] = useState(false)
    // const [subject, setSubject] = useState('') // Subject removed
    const [initialMessage, setInitialMessage] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        fetchConversations()
        fetchRoles()

        // Subscribe to new messages/conversations AND participant updates (for archive status)
        const channel = supabase
            .channel('chat_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchConversations()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_participants', filter: `user_id=eq.${currentUserId}` }, () => {
                fetchConversations()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const searchUsers = async (query: string) => {
        if (!query || query.length < 2) {
            setUserSearchResults([])
            return
        }

        setIsSearchingUsers(true)
        const { data, error } = await supabase.rpc('search_users', { search_term: query })

        if (data) {
            // Map result to UserProfile
            setUserSearchResults(data.map((u: any) => ({
                id: u.id,
                email: u.email,
                full_name: u.full_name
            })))
        }
        setIsSearchingUsers(false)
    }

    const fetchRoles = async () => {
        const { data } = await supabase.from('roles').select('id, name, display_name')
        if (data) setRoles(data)
    }

    const fetchConversations = async () => {
        // This is a complex query to get latest message and participants
        // For MVP, we might just fetch conversations and let RLS handle visibility
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                conversation_participants(user_id, is_archived)
            `)
            .order('last_message_at', { ascending: false })

        if (data) {
            // Filter and map based on participant status
            // The !inner join on participants works for specific user filters, but here we get all participants for the convs 
            // the user is in thanks to RLS.
            // However, the structure returned by supabase will have conversation_participants as an array.

            // We need to determine if THIS conversation is archived for THIS user.
            const mappedConversations = data.map((conv: any) => {
                const myParticipantRecord = conv.conversation_participants.find((p: any) => p.user_id === currentUserId)
                return {
                    ...conv,
                    is_archived: myParticipantRecord?.is_archived || false,
                    participants: conv.conversation_participants // keep all for display
                }
            })

            // Extract all user IDs from participants to fetch profiles AND conversation IDs for last messages
            const userIds = new Set<string>()
            const convIds: string[] = []

            mappedConversations.forEach((conv: any) => {
                convIds.push(conv.id)
                conv.conversation_participants?.forEach((p: any) => {
                    if (p.user_id !== currentUserId) {
                        userIds.add(p.user_id)
                    }
                })
            })

            // Fetch Profiles
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

            // Fetch Last Messages (One per conversation)
            // Ideally we'd use a postgres function or view for this to be efficient
            // but for now we will just fetch the last message for each displayed conversation
            // This is N+1 but limited to the list size. Better approach: dedicated view.
            // Let's try to get them in one go if possible.
            const { data: messagesData } = await supabase
                .from('messages')
                .select('conversation_id, content, created_at')
                .in('conversation_id', convIds)
                .order('created_at', { ascending: false })

            if (messagesData) {
                // We only want the *latest* message per conversation
                const lastMsgMap: Record<string, string> = {}
                // Since it's ordered by time desc, the first one we see for a conv_id is the latest
                messagesData.forEach(msg => {
                    if (!lastMsgMap[msg.conversation_id]) {
                        lastMsgMap[msg.conversation_id] = msg.content
                    }
                })
                // Mutate conversations to add lastMessagePreview (not in type but fine for JS, or we update type)
                mappedConversations.forEach((c: any) => {
                    c.lastMessagePreview = lastMsgMap[c.id]
                })
                setConversations(mappedConversations as Conversation[])
            } else {
                setConversations(mappedConversations as Conversation[])
            }
        }
        setIsLoading(false)
    }

    const startNewChat = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)

        try {
            let participantIds: string[] = []

            // If direct message, resolve email/user to ID
            if (newChatType === 'direct') {
                if (selectedUser) {
                    participantIds = [selectedUser.id]
                } else if (recipientEmail.trim()) {
                    // Fallback to manual email logic if they didn't select from dropdown
                    const { data: userData, error: userError } = await supabase
                        .rpc('get_user_by_email', { email_input: recipientEmail.trim() })
                        .single<any>()

                    if (userError || !userData) {
                        toast.error('User not found. Please check the email.')
                        setIsCreating(false)
                        return
                    }
                    participantIds = [userData.id]
                } else {
                    toast.error('Please select a user or enter an email')
                    setIsCreating(false)
                    return
                }
            } else if (newChatType === 'role') {
                if (!selectedRoleId) {
                    toast.error('Please select a role')
                    setIsCreating(false)
                    return
                }
                // We no longer need to fetch all users here because RLS/RPC will handle role access
                // but we keep participantIds empty or just the current user (which is added by RPC)
                participantIds = []
            }

            // Create Conversation via RPC
            const { data: conversationId, error } = await supabase
                .rpc('create_new_conversation', {
                    p_type: 'internal',
                    p_subject: null,
                    p_message: initialMessage.trim() || null,
                    p_participant_ids: participantIds,
                    p_target_role_id: newChatType === 'role' ? selectedRoleId : null
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
                setSelectedUser(null)
                setUserSearchResults([])
                setInitialMessage('')
                setNewChatType('role')
                setSelectedRoleId('')
            }

        } catch (err) {
            console.error('Unexpected error:', err)
            toast.error('Unexpected error occurred')
        } finally {
            setIsCreating(false)
        }
    }

    const toggleArchive = async (conversationId: string, e?: React.MouseEvent) => {
        e?.stopPropagation() // Prevent selecting the chat

        try {
            const { error } = await supabase.rpc('toggle_conversation_archive', { p_conversation_id: conversationId })

            if (error) {
                console.error('Error toggling archive:', error)
                toast.error('Failed to update archive status')
            } else {
                toast.success('Conversation updated')
                fetchConversations()
            }
        } catch (err) {
            console.error(err)
            toast.error('An error occurred')
        }
    }

    const getConversationTitle = (conv: Conversation) => {
        if (conv.type === 'support') return 'Support Ticket'

        // If it's a role-based chat, find the role name
        if (conv.target_role_id) {
            const role = roles.find(r => r.id === conv.target_role_id)
            if (role) return `${role.display_name} Team`
            return 'Team Chat'
        }

        const otherUserId = conv.participants?.find((p: any) => p.user_id !== currentUserId)?.user_id
        const profile = otherUserId ? profiles[otherUserId] : null

        if (profile?.full_name) return profile.full_name
        if (profile?.email) return profile.email

        return 'Direct Message'
    }

    const filteredConversations = conversations.filter(c =>
        activeTab === 'archived' ? c.is_archived : !c.is_archived
    )

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[var(--dashboard-card)] border-r border-[var(--dashboard-border)]">
            <div className="p-4 border-b border-[var(--dashboard-border)] space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg font-bold text-[var(--dashboard-text)]">Messages</h2>

                    <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                            <DialogHeader>
                                <DialogTitle>New Message</DialogTitle>
                                <DialogDescription className="text-[var(--dashboard-text-muted)]">
                                    Start a new conversation.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={startNewChat} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type" className="text-white font-medium">To</Label>
                                    <Select
                                        value={newChatType}
                                        onValueChange={(val: 'role' | 'direct') => setNewChatType(val)}
                                    >
                                        <SelectTrigger className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)] text-white">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="role">Role (Group)</SelectItem>
                                            <SelectItem value="direct">Specific Person (Email/Search)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {newChatType === 'role' && (
                                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="role" className="text-white font-medium">Select Role</Label>
                                        <Select
                                            value={selectedRoleId}
                                            onValueChange={setSelectedRoleId}
                                        >
                                            <SelectTrigger className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)] text-white">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map(role => (
                                                    <SelectItem key={role.id} value={role.id}>
                                                        {role.display_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {newChatType === 'direct' && (
                                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                                        <Label className="text-white font-medium">Recipient</Label>
                                        <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={userSearchOpen}
                                                    className="w-full justify-between bg-[var(--dashboard-background)] border-[var(--dashboard-border)] text-white hover:bg-[var(--dashboard-card-hover)] hover:text-white"
                                                >
                                                    {selectedUser ? selectedUser.full_name || selectedUser.email : (recipientEmail || "Search for a user...")}
                                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[450px] p-0 bg-[var(--dashboard-card)] border-[var(--dashboard-border)]">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="Search by name or email..."
                                                        onValueChange={(val) => {
                                                            setRecipientEmail(val) // Keep manual input sync
                                                            searchUsers(val)
                                                        }}
                                                        className="text-white"
                                                    />
                                                    <CommandList>
                                                        {isSearchingUsers && <div className="p-2 text-xs text-muted-foreground">Searching...</div>}
                                                        <CommandEmpty>No users found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {userSearchResults.map((user) => (
                                                                <CommandItem
                                                                    key={user.id}
                                                                    value={user.email}
                                                                    onSelect={() => {
                                                                        setSelectedUser(user)
                                                                        setRecipientEmail(user.email) // for visual fallback
                                                                        setUserSearchOpen(false)
                                                                    }}
                                                                    className="text-white hover:bg-[var(--dashboard-accent-gold)]/20 cursor-pointer"
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{user.full_name || 'Unknown Name'}</span>
                                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="message" className="text-white font-medium">Initial Message</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Type your first message..."
                                        value={initialMessage}
                                        onChange={(e) => setInitialMessage(e.target.value)}
                                        className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)] min-h-[100px] text-white placeholder:text-gray-400"
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

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'archived')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-[var(--dashboard-background)]">
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="archived">Archived</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="p-4 pt-0">
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
                    {filteredConversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => {
                                setSelectedId(conv.id)
                                setIsMobileOpen(false)
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors group relative cursor-pointer",
                                selectedId === conv.id
                                    ? "bg-[var(--dashboard-accent-gold)]/10"
                                    : "hover:bg-[var(--dashboard-card-hover)]"
                            )}
                        >
                            <Avatar className="h-10 w-10 border border-[var(--dashboard-border)] shrink-0">
                                <AvatarFallback className="bg-[var(--dashboard-background)] text-[var(--dashboard-text-muted)]">
                                    <MessageSquare className={cn(
                                        "h-5 w-5 transition-colors",
                                        selectedId === conv.id ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-text)]"
                                    )} />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden min-w-0 grid gap-0.5">
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        "font-bold text-sm truncate transition-colors",
                                        selectedId === conv.id ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text)]"
                                    )}>
                                        {getConversationTitle(conv)}
                                    </span>
                                    <span className="text-[10px] text-[var(--dashboard-text-muted)] whitespace-nowrap ml-2 shrink-0">
                                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--dashboard-text-muted)] truncate group-hover:text-[var(--dashboard-text)] transition-colors">
                                    {conv.lastMessagePreview || "Click to view conversation"}
                                </p>
                            </div>

                            <div onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                                        <DropdownMenuItem onClick={(e) => toggleArchive(conv.id, e)} className="hover:bg-[var(--dashboard-card-hover)] cursor-pointer">
                                            {conv.is_archived ? 'Unarchive' : 'Archive'} Conversation
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                    {filteredConversations.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-[var(--dashboard-text-muted)] text-sm">
                            <p>No {activeTab} messages.</p>
                            {activeTab === 'active' && (
                                <Button variant="link" onClick={() => setIsNewChatOpen(true)} className="text-[var(--dashboard-accent-gold)]">Start a chat</Button>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div >
    )

    const selectedConversation = conversations.find(c => c.id === selectedId)

    return (
        <div className="flex h-[calc(100vh-100px)] rounded-3xl overflow-hidden border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-2xl">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-80 lg:w-96">
                {sidebarContent}
            </div>

            {/* Mobile Sheet */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-0 w-80 border-r border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
                    {sidebarContent}
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

                {selectedId && selectedConversation ? (
                    <ChatWindow
                        conversationId={selectedId}
                        currentUserId={currentUserId}
                        title={getConversationTitle(selectedConversation)}
                        isArchived={!!selectedConversation.is_archived}
                        onArchive={() => toggleArchive(selectedId)}
                    />
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
