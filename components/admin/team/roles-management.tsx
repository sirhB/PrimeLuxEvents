'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, Settings, Plus } from 'lucide-react'

interface Role {
    id: string
    name: string
    display_name: string
    description: string | null
    color: string
    is_system_role: boolean
}

interface Permission {
    id: string
    name: string
    display_name: string
    description: string | null
    resource: string
    action: string
}

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

export function RolesManagement({ roles, canManage }: RolesManagementProps) {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    const getRoleStats = (role: Role) => {
        // This would normally fetch from the database
        // For now, return mock data
        return {
            memberCount: Math.floor(Math.random() * 10),
            permissionCount: Object.keys(resourceGroups).length * 2 // Rough estimate
        }
    }

    return (
        <div className="space-y-6">
            {/* Roles Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Roles & Permissions
                    </CardTitle>
                    <CardDescription>
                        Manage roles and their associated permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {roles.map((role) => {
                            const stats = getRoleStats(role)
                            return (
                                <Card
                                    key={role.id}
                                    className={`cursor-pointer transition-colors hover:shadow-md ${
                                        selectedRole?.id === role.id ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{role.display_name}</CardTitle>
                                            {role.is_system_role && (
                                                <Badge variant="secondary" className="text-xs">
                                                    System
                                                </Badge>
                                            )}
                                        </div>
                                        {role.description && (
                                            <CardDescription className="text-sm">
                                                {role.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="h-4 w-4" />
                                                {stats.memberCount} members
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Settings className="h-4 w-4" />
                                                {stats.permissionCount} permissions
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
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
                                        <div className="text-2xl font-bold">{getRoleStats(selectedRole).memberCount}</div>
                                        <div className="text-sm text-gray-500">Active Members</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <Settings className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold">{getRoleStats(selectedRole).permissionCount}</div>
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
                                    {Object.entries(resourceGroups).map(([resource, actions]) => (
                                        <div key={resource} className="border rounded-lg p-4">
                                            <h3 className="font-medium text-lg mb-3 capitalize">
                                                {resource.replace('_', ' ')} Management
                                            </h3>
                                            <div className="grid gap-2 md:grid-cols-5">
                                                {actions.map((action) => (
                                                    <div key={action} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`${resource}.${action}`}
                                                            className="rounded"
                                                            defaultChecked={Math.random() > 0.5} // Mock data
                                                        />
                                                        <label
                                                            htmlFor={`${resource}.${action}`}
                                                            className="text-sm capitalize cursor-pointer"
                                                        >
                                                            {action}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="members" className="space-y-4">
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Members list would be displayed here</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Showing users assigned to this role
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
