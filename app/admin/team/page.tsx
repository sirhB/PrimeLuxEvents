import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { requirePermission } from '@/lib/auth/authorization'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, Shield, UserPlus } from 'lucide-react'
import { TeamMembersList } from '@/components/admin/team/team-members-list'
import { RolesManagement } from '@/components/admin/team/roles-management'
import { InvitationsList } from '@/components/admin/team/invitations-list'
import { InviteUserDialog } from '@/components/admin/team/invite-user-dialog'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export const dynamic = 'force-dynamic'

export default async function TeamManagementPage() {
    // Require admin permission to access this page
    await requirePermission('users.view')

    const supabase = await createClient()
    let teamMembers: any[] = []
    let roles: any[] = []
    let invitations: any[] = []
    let serviceRoleError = false

    try {
        const serviceRoleSupabase = createServiceRoleClient()

        // Fetch team members using service role to bypass RLS issues in admin panel
        const { data: membersRes, error: membersError } = await serviceRoleSupabase
            .from('user_profiles')
            .select(`
                *,
                user_roles!user_id (
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
        const { data: rolesRes, error: rolesError } = await serviceRoleSupabase
            .from('roles')
            .select('*')
            .order('display_name')

        // Fetch pending and expired invitations (never select temp_password)
        const { data: invitationsRes, error: invitationsError } = await serviceRoleSupabase
            .from('user_invitations')
            .select('id, email, status, expires_at, created_at, invitation_token, invited_by, role_ids')
            .in('status', ['pending', 'expired'])
            .order('created_at', { ascending: false })

        if (membersError || rolesError || invitationsError) {
            console.error('Error fetching team data:', membersError || rolesError || invitationsError)
        }

        teamMembers = membersRes || []
        roles = rolesRes || []
        invitations = invitationsRes || []
    } catch (e) {
        console.error('Service Role initialization failed:', e)
        serviceRoleError = true
    }

    // Get current user for invited_by display
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    const canInviteUsers = await requirePermission('users.create').then(() => true).catch(() => false)
    const canManageRoles = await requirePermission('users.manage').then(() => true).catch(() => false)

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Administration"
                title="Team Management"
                description="Manage members, roles, and access permissions."
                actions={canInviteUsers ? <InviteUserDialog /> : undefined}
            />

            {serviceRoleError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">
                    <p className="font-bold">Configuration Error</p>
                    <p>The <code className="bg-red-500/20 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is missing from your environment variables. Please add it to your <code className="bg-red-500/20 px-1 rounded">.env.local</code> file to manage team members.</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-[var(--dashboard-text)]">
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
                        <div className="text-2xl font-semibold text-[var(--dashboard-text)]">
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
                        <div className="text-2xl font-semibold text-[var(--dashboard-text)]">
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
                        <div className="text-2xl font-semibold text-[var(--dashboard-text)]">
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
        </AdminPage>
    )
}
