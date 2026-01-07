'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Plus, Check, ChevronsUpDown } from 'lucide-react'
import { assignUserRole, removeUserRole, updateUserProfile } from '@/app/admin/actions'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

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

interface EditMemberDialogProps {
    member: TeamMember
    roles: Role[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function EditMemberDialog({ member, roles, open, onOpenChange, onSuccess }: EditMemberDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: member.full_name || '',
        phone: member.phone || '',
        job_title: member.job_title || '',
        department: member.department || '',
        hire_date: member.hire_date || '',
        is_active: member.is_active
    })
    const [memberRoles, setMemberRoles] = useState<string[]>(
        member.user_roles?.map(ur => ur.roles.id) || []
    )
    const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>('')
    const [rolePickerOpen, setRolePickerOpen] = useState(false)

    const handleAddRole = async () => {
        if (!selectedRoleToAdd) return

        setLoading(true)
        try {
            const result = await assignUserRole(member.id, selectedRoleToAdd)
            if (result.success) {
                setMemberRoles([...memberRoles, selectedRoleToAdd])
                setSelectedRoleToAdd('')
                toast.success('Role assigned successfully')
            } else {
                toast.error(result.error || 'Failed to assign role')
            }
        } catch (error) {
            console.error('Error assigning role:', error)
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveRole = async (roleId: string) => {
        setLoading(true)
        try {
            const result = await removeUserRole(member.id, roleId)
            if (result.success) {
                setMemberRoles(memberRoles.filter(r => r !== roleId))
                toast.success('Role removed successfully')
            } else {
                toast.error(result.error || 'Failed to remove role')
            }
        } catch (error) {
            console.error('Error removing role:', error)
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const result = await updateUserProfile(member.id, formData)
            if (result.success) {
                toast.success('Member updated successfully')
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error(result.error || 'Failed to update member')
            }
        } catch (error) {
            console.error('Error updating member:', error)
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const availableRoles = roles.filter(r => !memberRoles.includes(r.id))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                    <DialogDescription>
                        Update member information and manage their roles
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-sm">Basic Information</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={member.email}
                                    disabled
                                    className="bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_title">Job Title</Label>
                                <Input
                                    id="job_title"
                                    value={formData.job_title}
                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                    placeholder="Event Coordinator"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="Operations"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hire_date">Hire Date</Label>
                                <Input
                                    id="hire_date"
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded"
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Active Member
                            </Label>
                        </div>
                    </div>

                    {/* Roles Management */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium text-sm">Roles</h3>

                        {/* Current Roles */}
                        <div className="flex flex-wrap gap-2">
                            {memberRoles.length === 0 ? (
                                <p className="text-sm text-gray-500">No roles assigned</p>
                            ) : (
                                memberRoles.map(roleId => {
                                    const role = roles.find(r => r.id === roleId)
                                    if (!role) return null
                                    return (
                                        <Badge
                                            key={roleId}
                                            variant="outline"
                                            className="flex items-center gap-1 pr-1"
                                            style={{ borderColor: role.color, color: role.color }}
                                        >
                                            {role.display_name}
                                            <button
                                                onClick={() => handleRemoveRole(roleId)}
                                                disabled={loading}
                                                className="ml-1 hover:bg-gray-100 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )
                                })
                            )}
                        </div>

                        {/* Add Role */}
                        {availableRoles.length > 0 && (
                            <div className="flex items-end gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="add_role">Add Role</Label>
                                    <Popover open={rolePickerOpen} onOpenChange={setRolePickerOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={rolePickerOpen}
                                                className="w-full justify-between font-normal"
                                            >
                                                {selectedRoleToAdd
                                                    ? roles.find((role) => role.id === selectedRoleToAdd)?.display_name
                                                    : "Search roles..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search roles..." />
                                                <CommandEmpty>No role found.</CommandEmpty>
                                                <CommandGroup>
                                                    {availableRoles.map((role) => (
                                                        <CommandItem
                                                            key={role.id}
                                                            value={role.display_name}
                                                            onSelect={() => {
                                                                setSelectedRoleToAdd(role.id)
                                                                setRolePickerOpen(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedRoleToAdd === role.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-3 h-3 rounded"
                                                                    style={{ backgroundColor: role.color }}
                                                                />
                                                                {role.display_name}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Button
                                    onClick={handleAddRole}
                                    disabled={!selectedRoleToAdd || loading}
                                    size="icon"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
