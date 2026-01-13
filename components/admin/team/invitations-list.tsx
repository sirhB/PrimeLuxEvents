'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Mail, Clock, CheckCircle, XCircle, RefreshCw, Copy, Shield, User } from 'lucide-react'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { useRouter } from 'next/navigation'

interface Invitation {
    id: string
    email: string
    status: 'pending' | 'accepted' | 'expired' | 'cancelled'
    expires_at: string
    created_at: string
    invitation_token: string
    invited_by: string | null
    temp_password?: string
}

interface InvitationsListProps {
    invitations: Invitation[]
    canManage: boolean
}

export function InvitationsList({ invitations, canManage }: InvitationsListProps) {
    const router = useRouter()

    const handleCancel = async (id: string) => {
        try {
            const response = await fetch(`/api/team/invitations?id=${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to cancel invitation')

            toast.success('Invitation cancelled')
            router.refresh()
        } catch (error) {
            console.error('Error cancelling invitation:', error)
            toast.error('Failed to cancel invitation')
        }
    }

    const handleExtend = async (id: string, currentExpiry: string) => {
        try {
            // Extend by 7 more days from now
            const newExpiry = addDays(new Date(), 7).toISOString()

            const response = await fetch('/api/team/invitations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, expires_at: newExpiry })
            })

            if (!response.ok) throw new Error('Failed to extend invitation')

            toast.success('Invitation extended by 7 days')
            router.refresh()
        } catch (error) {
            console.error('Error extending invitation:', error)
            toast.error('Failed to extend invitation')
        }
    }
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
            case 'accepted':
                return <Badge variant="secondary" className="bg-green-100 text-green-800">Accepted</Badge>
            case 'expired':
                return <Badge variant="secondary" className="bg-red-100 text-red-800">Expired</Badge>
            case 'cancelled':
                return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Cancelled</Badge>
            default:
                return <Badge variant="secondary">Unknown</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'accepted':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'expired':
                return <XCircle className="h-4 w-4 text-red-500" />
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-gray-500" />
            default:
                return <Clock className="h-4 w-4 text-gray-500" />
        }
    }

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date()
    }

    return (
        <Card>
            <CardHeader className="border-b border-white/5 bg-white/5">
                <CardTitle className="text-xl font-serif text-[var(--dashboard-text)]">Pending Invitations</CardTitle>
                <CardDescription className="text-[var(--dashboard-text-muted)]">
                    Track and manage team member invitations
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {invitations.length === 0 ? (
                    <div className="text-center py-8">
                        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pending invitations.</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Invitations will appear here once sent.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invitations.map((invitation) => (
                            <div key={invitation.id} className="flex items-center justify-between p-4 glass-card border-none hover:bg-white/5 transition-colors">
                                <div className="flex items-center space-x-4">
                                    {getStatusIcon(invitation.status)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-[var(--dashboard-text)] truncate">
                                                {invitation.email}
                                            </h3>
                                            {getStatusBadge(invitation.status)}
                                            {isExpired(invitation.expires_at) && invitation.status === 'pending' && (
                                                <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/20 bg-red-500/5">
                                                    Expired
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] opacity-80">
                                            <span className="flex items-center gap-1.5">
                                                <Mail className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
                                                Sent {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
                                                Expires {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                                            </span>
                                            {invitation.temp_password && (
                                                <span className="flex items-center gap-1.5 text-[var(--dashboard-accent-gold)]">
                                                    <Shield className="h-3 w-3" />
                                                    Temp Pass Set
                                                </span>
                                            )}
                                            {invitation.invited_by && (
                                                <span className="flex items-center gap-1.5 font-bold uppercase tracking-[0.1em]">
                                                    <User className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
                                                    By: {invitation.invited_by.substring(0, 8)}
                                                </span>
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
                                        <DropdownMenuContent align="end" className="glass-card border-white/10 bg-black/90 text-[var(--dashboard-text)]">
                                            <DropdownMenuItem
                                                className="flex items-center gap-2 cursor-pointer focus:bg-[var(--dashboard-accent-gold)] focus:text-black"
                                                onClick={() => {
                                                    const url = `${window.location.origin}/invite/${invitation.invitation_token}`
                                                    navigator.clipboard.writeText(url)
                                                    toast.success('Invitation link copied')
                                                }}
                                            >
                                                <Copy className="h-4 w-4" />
                                                Copy Invite Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-[var(--dashboard-accent-gold)] focus:text-black">
                                                <Mail className="h-4 w-4" />
                                                Resend Email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="flex items-center gap-2 cursor-pointer focus:bg-[var(--dashboard-accent-gold)] focus:text-black"
                                                onClick={() => handleExtend(invitation.id, invitation.expires_at)}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Extend Expiry
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="flex items-center gap-2 text-red-600 cursor-pointer focus:bg-red-600 focus:text-white"
                                                onClick={() => handleCancel(invitation.id)}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Cancel Invitation
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
