'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, Users, Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { getRolesWithPermissions, getAllPermissions, updateRolePermissions, createRole, updateRole, deleteRole, getRoleMembers, type Permission, type RoleWithStats } from '@/app/admin/actions'
import { PERMISSION_AREAS } from '@/lib/auth/permission-catalog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface RolesManagementProps {
    roles: unknown[]
    canManage: boolean
}

const SUPER_ADMIN = 'super_admin'

export function RolesManagement({ canManage }: RolesManagementProps) {
    const [rolesData, setRolesData] = useState<RoleWithStats[]>([])
    const [allPermissions, setAllPermissions] = useState<Permission[]>([])
    const [selectedRole, setSelectedRole] = useState<RoleWithStats | null>(null)
    const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [roleMembers, setRoleMembers] = useState<Array<{ id: string; email: string; full_name: string | null; avatar_url: string | null; job_title: string | null }>>([])
    const [loadingMembers, setLoadingMembers] = useState(false)
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [draft, setDraft] = useState({ name: '', display_name: '', description: '', color: '#C9A962' })

    const fetchRolesData = async () => {
        setLoading(true)
        try {
            const [rolesResult, permissionsResult] = await Promise.all([
                getRolesWithPermissions(),
                getAllPermissions(),
            ])
            if (rolesResult.success && rolesResult.data) setRolesData(rolesResult.data)
            if (permissionsResult.success && permissionsResult.data) setAllPermissions(permissionsResult.data)
            return rolesResult.data || []
        } catch (error) {
            console.error('Error fetching roles:', error)
            return []
        } finally {
            setLoading(false)
        }
    }

    const selectRole = async (role: RoleWithStats) => {
        setSelectedRole(role)
        const permStates: Record<string, boolean> = {}
        if (role.name === SUPER_ADMIN) {
            allPermissions.forEach((permission) => {
                permStates[permission.id] = true
            })
        } else {
            role.permissions?.forEach((permission) => {
                permStates[permission.id] = true
            })
        }
        setPermissionStates(permStates)
        setLoadingMembers(true)
        try {
            const result = await getRoleMembers(role.id)
            setRoleMembers(result.success && result.data ? result.data : [])
        } catch (error) {
            console.error('Error fetching role members:', error)
            setRoleMembers([])
        } finally {
            setLoadingMembers(false)
        }
    }

    useEffect(() => {
        void fetchRolesData()
    }, [])

    const locked = !canManage || selectedRole?.name === SUPER_ADMIN
    const dirty = () => {
        if (!selectedRole || selectedRole.name === SUPER_ADMIN) return false
        const current = Object.entries(permissionStates).filter(([, on]) => on).map(([id]) => id).sort()
        const original = (selectedRole.permissions || []).map((permission) => permission.id).sort()
        return JSON.stringify(current) !== JSON.stringify(original)
    }

    const handleSavePermissions = async () => {
        if (!selectedRole) return
        setLoading(true)
        try {
            const selectedPermissionIds = Object.entries(permissionStates)
                .filter(([, on]) => on)
                .map(([id]) => id)
            const result = await updateRolePermissions(selectedRole.id, selectedPermissionIds)
            if (!result.success) {
                toast.error(result.error || 'Could not update permissions')
                return
            }
            toast.success('Permissions updated')
            const fresh = await fetchRolesData()
            const updated = fresh.find((role) => role.id === selectedRole.id)
            if (updated) await selectRole(updated)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        const result = await createRole(draft)
        if (!result.success) {
            toast.error(result.error || 'Could not create the role')
            return
        }
        toast.success('Role created')
        setCreateOpen(false)
        setDraft({ name: '', display_name: '', description: '', color: '#C9A962' })
        await fetchRolesData()
    }

    const handleEdit = async () => {
        if (!selectedRole) return
        const result = await updateRole(selectedRole.id, {
            display_name: draft.display_name,
            description: draft.description,
            color: draft.color,
        })
        if (!result.success) {
            toast.error(result.error || 'Could not update the role')
            return
        }
        toast.success('Role updated')
        setEditOpen(false)
        const fresh = await fetchRolesData()
        const updated = fresh.find((role) => role.id === selectedRole.id)
        if (updated) await selectRole(updated)
    }

    const handleDelete = async (role: RoleWithStats) => {
        if (!window.confirm(`Delete the ${role.display_name} role?`)) return
        const result = await deleteRole(role.id)
        if (!result.success) {
            toast.error(result.error || 'Could not delete the role')
            return
        }
        toast.success('Role deleted')
        if (selectedRole?.id === role.id) setSelectedRole(null)
        await fetchRolesData()
    }

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-sm">
                <CardHeader className="flex flex-col gap-4 border-b border-[var(--dashboard-border)] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 font-serif text-2xl text-[var(--dashboard-text)]">
                            <Shield className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                            Roles & Permissions
                        </CardTitle>
                        <CardDescription className="mt-1 text-[var(--dashboard-text-muted)]">
                            Super Admin always has full access. Every other role is a set of toggles, and changes are written to the audit log.
                        </CardDescription>
                    </div>
                    {canManage && (
                        <Button onClick={() => setCreateOpen(true)} className="rounded-full">
                            <Plus className="mr-2 h-4 w-4" />
                            New role
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="pt-6">
                    {loading && rolesData.length === 0 ? (
                        <p className="text-sm text-[var(--dashboard-text-muted)]">Loading roles…</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {rolesData.map((role) => {
                                const selected = selectedRole?.id === role.id
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => void selectRole(role)}
                                        className={`rounded-2xl border bg-[var(--lux-cream,#F7F1E6)] p-4 text-left transition ${selected ? 'border-[var(--dashboard-accent-gold)] ring-2 ring-[var(--dashboard-accent-gold)]/40' : 'border-transparent hover:border-[var(--dashboard-border)]'}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-serif text-lg text-[var(--dashboard-text)]">{role.display_name}</p>
                                                <p className="mt-1 line-clamp-2 text-xs text-[var(--dashboard-text-muted)]">{role.description}</p>
                                            </div>
                                            <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: role.color }} />
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {role.name === SUPER_ADMIN && <Badge className="bg-[var(--lux-navy,#0F1B2D)] text-[var(--theme-on-dark,#FAF7F2)]">Full access</Badge>}
                                            {role.is_system_role && role.name !== SUPER_ADMIN && <Badge variant="secondary">System</Badge>}
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                                {role.memberCount || 0} members
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedRole && (
                <Card className="rounded-3xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-sm">
                    <CardHeader className="flex flex-col gap-3 border-b border-[var(--dashboard-border)] sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="font-serif text-2xl text-[var(--dashboard-text)]">
                                {selectedRole.display_name}
                            </CardTitle>
                            <CardDescription className="text-[var(--dashboard-text-muted)]">
                                {selectedRole.name === SUPER_ADMIN
                                    ? 'This role cannot be restricted, renamed, or deleted.'
                                    : 'Turn access on or off for each area. Assign the role from a team member profile.'}
                            </CardDescription>
                        </div>
                        {canManage && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => {
                                        setDraft({
                                            name: selectedRole.name,
                                            display_name: selectedRole.display_name,
                                            description: selectedRole.description || '',
                                            color: selectedRole.color,
                                        })
                                        setEditOpen(true)
                                    }}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit label
                                </Button>
                                {!selectedRole.is_system_role && selectedRole.name !== SUPER_ADMIN && (
                                    <Button variant="outline" className="rounded-full" onClick={() => void handleDelete(selectedRole)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid gap-3">
                            {PERMISSION_AREAS.map((area) => {
                                const rows = area.actions.map((action) =>
                                    allPermissions.find((permission) => permission.name === `${area.resource}.${action}`),
                                )
                                return (
                                    <div key={area.resource} className="rounded-2xl border border-[var(--dashboard-border)] p-4">
                                        <div className="mb-3">
                                            <h3 className="font-serif text-lg text-[var(--dashboard-text)]">{area.label}</h3>
                                            <p className="text-xs text-[var(--dashboard-text-muted)]">{area.description}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {area.actions.map((action, index) => {
                                                const permission = rows[index]
                                                const checked = permission ? Boolean(permissionStates[permission.id]) || selectedRole.name === SUPER_ADMIN : false
                                                return (
                                                    <label key={action} className="flex items-center gap-2 rounded-full bg-[var(--lux-mist,#F4F6FA)] px-3 py-2 text-sm text-[var(--dashboard-text)]">
                                                        <Checkbox
                                                            checked={checked}
                                                            disabled={locked || !permission}
                                                            onCheckedChange={(value) => {
                                                                if (!permission) return
                                                                setPermissionStates((prev) => ({ ...prev, [permission.id]: value === true }))
                                                            }}
                                                        />
                                                        <span className="capitalize">{action}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {canManage && selectedRole.name !== SUPER_ADMIN && dirty() && (
                            <div className="flex gap-2 border-t border-[var(--dashboard-border)] pt-4">
                                <Button onClick={() => void handleSavePermissions()} disabled={loading} className="rounded-full">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save permissions
                                </Button>
                                <Button variant="outline" className="rounded-full" onClick={() => void selectRole(selectedRole)} disabled={loading}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                            </div>
                        )}

                        <div>
                            <h3 className="mb-3 flex items-center gap-2 font-serif text-lg text-[var(--dashboard-text)]">
                                <Users className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                Members
                            </h3>
                            {loadingMembers ? (
                                <p className="text-sm text-[var(--dashboard-text-muted)]">Loading members…</p>
                            ) : roleMembers.length === 0 ? (
                                <p className="text-sm text-[var(--dashboard-text-muted)]">No one has this role yet.</p>
                            ) : (
                                <div className="grid gap-3 md:grid-cols-2">
                                    {roleMembers.map((member) => (
                                        <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-[var(--lux-cream,#F7F1E6)] p-3">
                                            <Avatar>
                                                <AvatarImage src={member.avatar_url || undefined} />
                                                <AvatarFallback>{(member.full_name || member.email).slice(0, 1).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-[var(--dashboard-text)]">{member.full_name || 'Unnamed'}</p>
                                                <p className="truncate text-xs text-[var(--dashboard-text-muted)]">{member.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-serif">New role</DialogTitle>
                        <DialogDescription>Create a role, then turn on the permissions it should have.</DialogDescription>
                    </DialogHeader>
                    <RoleFields draft={draft} setDraft={setDraft} includeName />
                    <DialogFooter>
                        <Button className="rounded-full" onClick={() => void handleCreate()}>Create role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-serif">Edit role</DialogTitle>
                        <DialogDescription>Update the label people see. The internal name stays the same.</DialogDescription>
                    </DialogHeader>
                    <RoleFields draft={draft} setDraft={setDraft} />
                    <DialogFooter>
                        <Button className="rounded-full" onClick={() => void handleEdit()}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function RoleFields({
    draft,
    setDraft,
    includeName = false,
}: {
    draft: { name: string; display_name: string; description: string; color: string }
    setDraft: (value: { name: string; display_name: string; description: string; color: string }) => void
    includeName?: boolean
}) {
    return (
        <div className="space-y-3">
            {includeName && (
                <div className="space-y-2">
                    <Label htmlFor="role-name">Internal name</Label>
                    <Input
                        id="role-name"
                        value={draft.name}
                        placeholder="showroom_lead"
                        onChange={(event) => setDraft({ ...draft, name: event.target.value.toLowerCase() })}
                    />
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="role-label">Label</Label>
                <Input
                    id="role-label"
                    value={draft.display_name}
                    onChange={(event) => setDraft({ ...draft, display_name: event.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                    id="role-description"
                    value={draft.description}
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="role-color">Color</Label>
                <Input
                    id="role-color"
                    type="color"
                    value={draft.color}
                    onChange={(event) => setDraft({ ...draft, color: event.target.value })}
                />
            </div>
        </div>
    )
}
