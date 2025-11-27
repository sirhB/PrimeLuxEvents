'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, MessageSquare, FileText } from 'lucide-react'
import { format } from 'date-fns'

export type CommunicationType = 'call' | 'email' | 'text' | 'note'

export interface Communication {
    id: string
    type: CommunicationType
    content: string
    created_by: string
    created_at: string
}

interface CommunicationLogProps {
    communications: Communication[]
}

const typeIcons = {
    call: Phone,
    email: Mail,
    text: MessageSquare,
    note: FileText,
}

const typeLabels = {
    call: 'Call',
    email: 'Email',
    text: 'Text',
    note: 'Note',
}

const typeColors = {
    call: 'text-blue-600 bg-blue-50 border-blue-200',
    email: 'text-purple-600 bg-purple-50 border-purple-200',
    text: 'text-green-600 bg-green-50 border-green-200',
    note: 'text-gray-600 bg-gray-50 border-gray-200',
}

export function CommunicationLog({ communications }: CommunicationLogProps) {
    if (communications.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Communication Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No communications yet. Add a call, email, text, or note to get started.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Communication Log</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {communications.map((communication) => {
                        const Icon = typeIcons[communication.type]
                        return (
                            <div
                                key={communication.id}
                                className={`flex gap-4 p-4 rounded-lg border ${typeColors[communication.type]}`}
                            >
                                <div className="flex-shrink-0">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">
                                            {typeLabels[communication.type]}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(communication.created_at), 'MMM d, yyyy h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{communication.content}</p>
                                    <p className="text-xs text-muted-foreground">By {communication.created_by}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

