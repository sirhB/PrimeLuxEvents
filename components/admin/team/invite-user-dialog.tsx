'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, X, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Role {
    id: string
    name: string
    display_name: string
    color: string
}

interface InviteUserDialogProps {
    trigger?: React.ReactNode
}

export function InviteUserDialog({ trigger }: InviteUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [tempPassword, setTempPassword] = useState('')
    const [invitationLink, setInvitationLink] = useState('')
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [availableRoles, setAvailableRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingRoles, setLoadingRoles] = useState(false)

    const handleOpenChange = async (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen && availableRoles.length === 0) {
            // Fetch available roles when dialog opens
            setLoadingRoles(true)
            try {
                const supabase = createClient()
                const { data: roles, error } = await supabase
                    .from('roles')
                    .select('*')
                    .order('display_name')

                if (error) throw error
                setAvailableRoles(roles || [])
            } catch (error) {
                console.error('Error fetching roles:', error)
                toast.error('Failed to load roles')
            } finally {
                setLoadingRoles(false)
            }
        }
    }

    const addRole = (roleId: string) => {
        if (!selectedRoles.includes(roleId)) {
            setSelectedRoles([...selectedRoles, roleId])
        }
    }

    const generateTempPassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
        let password = ''
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setTempPassword(password)
    }

    const removeRole = (roleId: string) => {
        setSelectedRoles(selectedRoles.filter(id => id !== roleId))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error('Email is required')
            return
        }

        if (selectedRoles.length === 0) {
            toast.error('At least one role must be selected')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/team/invitations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.trim(),
                    role_ids: selectedRoles,
                    temp_password: tempPassword
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invitation')
            }

            toast.success('Invitation created successfully!')
            const url = `${window.location.origin}/invite/${data.invitation.invitation_token}`
            setInvitationLink(url)
            // Note: We don't clear email/tempPassword yet so the admin can copy the link
            // setOpen(false)

            // Here you would typically send an email with the invitation link
            // For now, show the invitation URL that can be shared
            const invitationUrl = `${window.location.origin}/invite/${data.invitation.invitation_token}`
            console.log('Invitation URL:', invitationUrl) // In production, this would be emailed

        } catch (error: any) {
            console.error('Error creating invitation:', error)
            toast.error(error.message || 'Failed to send invitation')
        } finally {
            setLoading(false)
        }
    }

    const getRoleById = (id: string) => availableRoles.find(role => role.id === id)

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Team Member
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Create an invitation for a new team member. Set a temporary password they'll use to verify their identity.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="tempPassword">Temporary Password</Label>
                        <div className="flex gap-2">
                            <Input
                                id="tempPassword"
                                type="text"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                                placeholder="Temporary password"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={generateTempPassword}
                                className="shrink-0"
                            >
                                Generate
                            </Button>
                        </div>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider mt-1">
                            The user will need this password to finalize their account.
                        </p>
                    </div>

                    <div>
                        <Label>Roles</Label>
                        <Select onValueChange={addRole} disabled={loadingRoles}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select roles to assign..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableRoles.map((role) => (
                                    <SelectItem
                                        key={role.id}
                                        value={role.id}
                                        disabled={selectedRoles.includes(role.id)}
                                    >
                                        {role.display_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {loadingRoles && (
                            <p className="text-sm text-gray-500 mt-1">Loading roles...</p>
                        )}

                        {/* Selected Roles */}
                        {selectedRoles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedRoles.map((roleId) => {
                                    const role = getRoleById(roleId)
                                    return role ? (
                                        <Badge key={roleId} variant="secondary" className="flex items-center gap-1">
                                            {role.display_name}
                                            <button
                                                type="button"
                                                onClick={() => removeRole(roleId)}
                                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ) : null
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="submit" disabled={loading || !!invitationLink}>
                            {loading ? 'Creating...' : 'Create Invitation'}
                        </Button>
                    </div>

                    {invitationLink && (
                        <div className="mt-6 p-4 rounded-lg bg-black/20 border border-[var(--dashboard-accent-gold)]/20 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)]">Invitation Link</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px]"
                                    onClick={() => {
                                        navigator.clipboard.writeText(invitationLink)
                                        toast.success('Link copied to clipboard')
                                    }}
                                >
                                    Copy Link
                                </Button>
                            </div>
                            <div className="p-2 bg-black/40 rounded border border-white/5 break-all">
                                <code className="text-xs text-[var(--dashboard-text)]">
                                    {invitationLink}
                                </code>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Temporary Password</span>
                                <code className="text-sm text-[var(--dashboard-accent-gold)] font-mono">{tempPassword}</code>
                            </div>
                            <Button
                                type="button"
                                className="w-full mt-2"
                                onClick={() => {
                                    setOpen(false)
                                    setEmail('')
                                    setTempPassword('')
                                    setInvitationLink('')
                                    setSelectedRoles([])
                                }}
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </form>
            </DialogContent>
        </Dialog >
    )
}
