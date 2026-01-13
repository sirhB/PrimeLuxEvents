'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Shield, Users, Settings, Plus, Edit, Trash2, Save, X, User } from 'lucide-react'
import { getRolesWithPermissions, getAllPermissions, getRoleStats, updateRolePermissions, createRole, updateRole, deleteRole, getRoleMembers, type Role, type Permission, type RoleWithStats } from '@/app/admin/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface RolesManagementProps {
    roles: Role[]
    canManage: boolean
}

const resourceGroups = {
    events: ['view', 'create', 'update', 'delete', 'manage'],
    orders: ['view', 'create', 'update', 'delete', 'manage'],
    products: ['view', 'create', 'update', 'delete', 'manage'],
    customers: ['view', 'create', 'update', 'delete', 'manage'],
    consultations: ['view', 'create', 'update', 'delete', 'manage'],
    appointments: ['view', 'create', 'update', 'delete', 'manage'],
    content: ['view', 'create', 'update', 'delete', 'manage'],
    settings: ['view', 'update', 'manage'],
    users: ['view', 'create', 'update', 'delete', 'manage'],
    reports: ['view', 'create', 'manage']
}

export function RolesManagement({ roles: initialRoles, canManage }: RolesManagementProps) {
    const [rolesData, setRolesData] = useState<RoleWithStats[]>([])
    const [allPermissions, setAllPermissions] = useState<Permission[]>([])
    const [selectedRole, setSelectedRole] = useState<RoleWithStats | null>(null)
    const [editingRole, setEditingRole] = useState<RoleWithStats | null>(null)
    const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [roleMembers, setRoleMembers] = useState<any[]>([])
    const [loadingMembers, setLoadingMembers] = useState(false)

    const fetchRolesData = async () => {
        setLoading(true)
        try {
            const [rolesResult, permissionsResult] = await Promise.all([
                getRolesWithPermissions(),
                getAllPermissions()
            ])

            if (rolesResult.success && rolesResult.data) {
                setRolesData(rolesResult.data)
            }

            if (permissionsResult.success && permissionsResult.data) {
                setAllPermissions(permissionsResult.data)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleClick = async (role: RoleWithStats) => {
        setSelectedRole(role)
        // Initialize permission states for this role
        const permStates: Record<string, boolean> = {}
        role.permissions?.forEach(perm => {
            permStates[perm.id] = true
        })
        setPermissionStates(permStates)

        // Fetch members for this role
        setLoadingMembers(true)
        try {
            const result = await getRoleMembers(role.id)
            if (result.success && result.data) {
                setRoleMembers(result.data)
            } else {
                setRoleMembers([])
            }
        } catch (error) {
            console.error('Error fetching role members:', error)
            setRoleMembers([])
        } finally {
            setLoadingMembers(false)
        }
    }

    const handleEditRole = (role: RoleWithStats) => {
        setEditingRole(role)
        setEditDialogOpen(true)
    }

    const handleSavePermissions = async () => {
        if (!selectedRole) return

        setLoading(true)
        try {
            const selectedPermissionIds = Object.entries(permissionStates)
                .filter(([_, isSelected]) => isSelected)
                .map(([permId]) => permId)

            const result = await updateRolePermissions(selectedRole.id, selectedPermissionIds)

            if (result.success) {
                toast.success('Permissions updated successfully')
                await fetchRolesData()
                // Re-select the role to refresh the data
                const updatedRole = rolesData.find(r => r.id === selectedRole.id)
                if (updatedRole) {
                    handleRoleClick(updatedRole)
                }
            } else {
                toast.error(result.error || 'Failed to update permissions')
            }
        } catch (error) {
            console.error('Error saving permissions:', error)
            toast.error('An error occurred while saving permissions')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelPermissions = () => {
        if (selectedRole) {
            // Reset to original permissions
            const permStates: Record<string, boolean> = {}
            selectedRole.permissions?.forEach(perm => {
                permStates[perm.id] = true
            })
            setPermissionStates(permStates)
        }
    }

    const hasPermissionChanges = () => {
        if (!selectedRole) return false

        const currentPermissionIds = Object.entries(permissionStates)
            .filter(([_, isSelected]) => isSelected)
            .map(([permId]) => permId)
            .sort()

        const originalPermissionIds = (selectedRole.permissions || [])
            .map(p => p.id)
            .sort()

        return JSON.stringify(currentPermissionIds) !== JSON.stringify(originalPermissionIds)
    }

    useEffect(() => {
        fetchRolesData()
    }, [])

    return (
        <div className="space-y-6">
            {/* Roles Overview */}
            <Card className="glass-card border-none overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/5">
                    <CardTitle className="flex items-center gap-2 text-xl font-serif text-[var(--dashboard-text)]">
                        <Shield className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                        Roles & Permissions
                    </CardTitle>
                    <CardDescription className="text-[var(--dashboard-text-muted)]">
                        Manage roles and their associated permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {rolesData.map((role) => (
                            <Card
                                key={role.id}
                                className={`cursor-pointer transition-all duration-300 glass-card border-none hover:bg-white/5 ${selectedRole?.id === role.id ? 'ring-1 ring-[var(--dashboard-accent-gold)]' : ''
                                    }`}
                                onClick={() => handleRoleClick(role)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg text-[var(--dashboard-text)]">{role.display_name}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            {role.is_system_role && (
                                                <Badge variant="secondary" className="text-[10px] bg-white/10 text-[var(--dashboard-text-muted)] border-white/5 uppercase tracking-widest font-bold">
                                                    System
                                                </Badge>
                                            )}
                                            {canManage && !role.is_system_role && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-white/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleEditRole(role)
                                                    }}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {role.description && (
                                        <CardDescription className="text-xs text-[var(--dashboard-text-muted)] leading-relaxed">
                                            {role.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                            <Users className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                            {role.memberCount || 0} members
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                            <Settings className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                            {role.permissions?.length || 0} permissions
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {canManage && (
                        <div className="mt-6 pt-6 border-t">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Role
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Role Details */}
            {selectedRole && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: selectedRole.color }}
                            />
                            {selectedRole.display_name} Permissions
                        </CardTitle>
                        <CardDescription>
                            Detailed breakdown of permissions for this role
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                                <TabsTrigger value="members">Members</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="text-center p-4 border rounded-lg">
                                        <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold">{selectedRole.memberCount || 0}</div>
                                        <div className="text-sm text-gray-500">Active Members</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <Settings className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold">{selectedRole.permissions?.length || 0}</div>
                                        <div className="text-sm text-gray-500">Permissions</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold">{selectedRole.is_system_role ? 'Yes' : 'No'}</div>
                                        <div className="text-sm text-gray-500">System Role</div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="permissions" className="space-y-4">
                                <div className="space-y-6">
                                    {Object.entries(resourceGroups).map(([resource, actions]) => {
                                        const resourcePermissions = allPermissions.filter(p => p.resource === resource)
                                        if (resourcePermissions.length === 0) return null

                                        return (
                                            <div key={resource} className="border rounded-lg p-4">
                                                <h3 className="font-medium text-lg mb-3 capitalize">
                                                    {resource.replace('_', ' ')} Management
                                                </h3>
                                                <div className="grid gap-2 md:grid-cols-5">
                                                    {resourcePermissions.map((permission) => (
                                                        <div key={permission.id} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                id={permission.id}
                                                                className="rounded"
                                                                checked={permissionStates[permission.id] || false}
                                                                disabled={!canManage || selectedRole?.is_system_role}
                                                                onChange={(e) => {
                                                                    setPermissionStates(prev => ({
                                                                        ...prev,
                                                                        [permission.id]: e.target.checked
                                                                    }))
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={permission.id}
                                                                className="text-sm capitalize cursor-pointer"
                                                                title={permission.description || permission.display_name}
                                                            >
                                                                {permission.action}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Save/Cancel Buttons */}
                                {canManage && !selectedRole?.is_system_role && hasPermissionChanges() && (
                                    <div className="flex items-center gap-2 pt-4 border-t">
                                        <Button
                                            onClick={handleSavePermissions}
                                            disabled={loading}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancelPermissions}
                                            disabled={loading}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                )}

                                {selectedRole?.is_system_role && (
                                    <div className="text-sm text-gray-500 italic pt-4 border-t">
                                        System roles cannot be modified
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="members" className="space-y-4">
                                {loadingMembers ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--dashboard-accent-gold)] mx-auto"></div>
                                        <p className="text-gray-500 mt-2">Loading members...</p>
                                    </div>
                                ) : roleMembers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">No members assigned to this role</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {roleMembers.map((member) => (
                                            <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50/50">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={member.avatar_url} />
                                                    <AvatarFallback>
                                                        {member.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || member.email[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {member.full_name || 'Unnamed User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {member.email}
                                                    </p>
                                                    {member.job_title && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5 truncate uppercase tracking-wider font-bold">
                                                            {member.job_title}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
