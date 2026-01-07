import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/authorization'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, Shield, UserPlus } from 'lucide-react'
import { TeamMembersList } from '@/components/admin/team/team-members-list'
import { RolesManagement } from '@/components/admin/team/roles-management'
import { InvitationsList } from '@/components/admin/team/invitations-list'
import { InviteUserDialog } from '@/components/admin/team/invite-user-dialog'

export const dynamic = 'force-dynamic'

export default async function TeamManagementPage() {
    // Require admin permission to access this page
    await requirePermission('users.view')

    const supabase = await createClient()

    // Fetch team members
    const { data: teamMembers, error: membersError } = await supabase
        .from('user_profiles')
        .select(`
            *,
            user_roles (
                roles (
                    id,
                    name,
                    display_name,
                    color
                )
            )
        `)
        .order('created_at', { ascending: false })

    // Fetch roles
    const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('display_name')

    // Fetch pending invitations
    const { data: invitations, error: invitationsError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (membersError || rolesError || invitationsError) {
        console.error('Error fetching team data:', membersError || rolesError || invitationsError)
    }

    // Get current user for invited_by display
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    const canInviteUsers = await requirePermission('users.create').then(() => true).catch(() => false)
    const canManageRoles = await requirePermission('users.manage').then(() => true).catch(() => false)

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Administration
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Team Management
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Manage members, roles, and access permissions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {canInviteUsers && <InviteUserDialog />}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-serif text-[var(--dashboard-text)]">
                            {teamMembers?.filter(m => m.is_active).length || 0}
                        </div>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider mt-1">
                            Active team members
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Administrators</CardTitle>
                        <Shield className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-serif text-[var(--dashboard-text)]">
                            {teamMembers?.filter(m =>
                                m.is_active && m.user_roles?.some((ur: any) => ur.roles?.name === 'admin')
                            ).length || 0}
                        </div>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider mt-1">
                            Admin access users
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Available Roles</CardTitle>
                        <Shield className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-serif text-[var(--dashboard-text)]">
                            {roles?.length || 0}
                        </div>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider mt-1">
                            Defined permissions
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Pending Invites</CardTitle>
                        <UserPlus className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-serif text-[var(--dashboard-text)]">
                            {invitations?.length || 0}
                        </div>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider mt-1">
                            Awaiting response
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="members" className="w-full">
                <TabsList className="glass-card border-none p-1 bg-black/20 mb-6 w-fit h-auto">
                    <TabsTrigger value="members" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">Team Members</TabsTrigger>
                    <TabsTrigger value="roles" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">Roles & Permissions</TabsTrigger>
                    <TabsTrigger value="invitations" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">Invitations</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-6">
                    <TeamMembersList
                        members={teamMembers || []}
                        roles={roles || []}
                        canManage={canManageRoles}
                    />
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                    <RolesManagement
                        roles={roles || []}
                        canManage={canManageRoles}
                    />
                </TabsContent>

                <TabsContent value="invitations" className="space-y-6">
                    <InvitationsList
                        invitations={invitations || []}
                        canManage={canInviteUsers}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
