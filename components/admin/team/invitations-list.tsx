'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Mail, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface Invitation {
    id: string
    email: string
    status: 'pending' | 'accepted' | 'expired' | 'cancelled'
    expires_at: string
    created_at: string
    invited_by: string | null
}

interface InvitationsListProps {
    invitations: Invitation[]
    canManage: boolean
}

export function InvitationsList({ invitations, canManage }: InvitationsListProps) {
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
            <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                    Track and manage team member invitations
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                            <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    {getStatusIcon(invitation.status)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {invitation.email}
                                            </h3>
                                            {getStatusBadge(invitation.status)}
                                            {isExpired(invitation.expires_at) && invitation.status === 'pending' && (
                                                <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                                    Expired
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>
                                                Sent {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                                            </span>
                                            <span>
                                                Expires {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                                            </span>
                                            {invitation.invited_by && (
                                                <span>
                                                    Invited by: {invitation.invited_by}
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
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Resend Invitation
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4" />
                                                Extend Expiry
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="flex items-center gap-2 text-red-600">
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
