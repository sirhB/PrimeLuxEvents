'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Mail, Phone, Calendar, Edit, Trash2, Shield, User, Search } from 'lucide-react'
import { format } from 'date-fns'
import { EditMemberDialog } from './edit-member-dialog'
import { updateUserProfile } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

interface TeamMember {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    phone: string | null
    job_title: string | null
    department: string | null
    hire_date: string | null
    is_active: boolean
    last_login_at: string | null
    user_roles: Array<{
        roles: {
            id: string
            name: string
            display_name: string
            color: string
        }
    }>
}

interface Role {
    id: string
    name: string
    display_name: string
    color: string
}

interface TeamMembersListProps {
    members: TeamMember[]
    roles: Role[]
    canManage: boolean
}

export function TeamMembersList({ members, roles, canManage }: TeamMembersListProps) {
    const router = useRouter()
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredMembers = members.filter(member => {
        const query = searchQuery.toLowerCase()
        return (
            member.full_name?.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query) ||
            member.user_roles?.some(ur => ur.roles?.display_name.toLowerCase().includes(query))
        )
    })

    const getInitials = (name: string | null, email: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase()
        }
        return email[0].toUpperCase()
    }

    const formatLastLogin = (lastLogin: string | null) => {
        if (!lastLogin) return 'Never'
        return format(new Date(lastLogin), 'MMM d, yyyy')
    }

    const handleEditMember = (member: TeamMember) => {
        setSelectedMember(member)
        setEditDialogOpen(true)
    }

    const handleToggleActive = async (member: TeamMember) => {
        try {
            const result = await updateUserProfile(member.id, {
                is_active: !member.is_active
            })

            if (result.success) {
                toast.success(`Member ${member.is_active ? 'deactivated' : 'activated'} successfully`)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update member status')
            }
        } catch (error) {
            console.error('Error toggling member status:', error)
            toast.error('An error occurred')
        }
    }

    const handleDialogSuccess = () => {
        router.refresh()
    }

    return (
        <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 border-b border-white/5 bg-white/5">
                <div>
                    <CardTitle className="text-xl font-serif text-[var(--dashboard-text)]">Team Members</CardTitle>
                    <CardDescription className="text-[var(--dashboard-text-muted)]">
                        Manage your team members and their roles
                    </CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members or roles..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                {filteredMembers.length === 0 ? (
                    <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No team members found.</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchQuery ? 'Try adjusting your search query.' : 'Invite your first team member to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-5 glass-card border-none hover:bg-white/5 transition-all duration-300">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={member.avatar_url || undefined} />
                                        <AvatarFallback>
                                            {getInitials(member.full_name, member.email)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-[var(--dashboard-text)] truncate">
                                                {member.full_name || 'Unnamed User'}
                                            </h3>
                                            {!member.is_active && (
                                                <Badge variant="secondary" className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-[var(--dashboard-text-muted)] truncate font-light">{member.email}</p>

                                        <div className="flex items-center gap-4 mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] opacity-80">
                                            {member.job_title && (
                                                <span className="flex items-center gap-1.5">
                                                    <Shield className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
                                                    {member.job_title}
                                                </span>
                                            )}
                                            {member.last_login_at && (
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
                                                    Last login: {formatLastLogin(member.last_login_at)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Roles */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {member.user_roles?.map((userRole) => (
                                                <Badge
                                                    key={userRole.roles.id}
                                                    variant="outline"
                                                    className="text-xs"
                                                    style={{ borderColor: userRole.roles.color, color: userRole.roles.color }}
                                                >
                                                    {userRole.roles.display_name}
                                                </Badge>
                                            )) || (
                                                    <Badge variant="outline" className="text-xs text-gray-400">
                                                        No roles assigned
                                                    </Badge>
                                                )}
                                        </div>
                                    </div>
                                </div>

                                {canManage && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="flex items-center gap-2"
                                                onClick={() => handleEditMember(member)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit Member
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="flex items-center gap-2 text-red-600"
                                                onClick={() => handleToggleActive(member)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {member.is_active ? 'Deactivate' : 'Activate'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Edit Member Dialog */}
            {selectedMember && (
                <EditMemberDialog
                    member={selectedMember}
                    roles={roles}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    onSuccess={handleDialogSuccess}
                />
            )}
        </Card>
    )
}
