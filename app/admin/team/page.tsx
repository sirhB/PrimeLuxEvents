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
        <div className="flex flex-col gap-6 p-6 bg-muted/30 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage team members, roles, and permissions
                    </p>
                </div>
                {canInviteUsers && <InviteUserDialog />}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMembers?.filter(m => m.is_active).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active team members
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {teamMembers?.filter(m =>
                                m.is_active && m.user_roles?.some((ur: any) => ur.roles?.name === 'admin')
                            ).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Admin users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Roles</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {roles?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available roles
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {invitations?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting acceptance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="members">Team Members</TabsTrigger>
                    <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                    <TabsTrigger value="invitations">Invitations</TabsTrigger>
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
