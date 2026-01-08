'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MessageSquare, FileText, Trash2 } from 'lucide-react'
import { AddCommunicationDialog } from './add-communication-dialog'
import { DeleteConsultationDialog } from './delete-consultation-dialog'

interface ConsultationCardActionsProps {
    consultationId: string
    customerName: string
    customerEmail?: string | null
    customerPhone?: string | null
}

export function ConsultationCardActions({
    consultationId,
    customerName,
    customerEmail,
    customerPhone,
}: ConsultationCardActionsProps) {
    const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false)

    return (
        <>
            <div className="flex items-center gap-1">
                {customerPhone && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" asChild>
                        <a href={`tel:${customerPhone}`} title="Call">
                            <Phone className="h-4 w-4 text-gray-500" />
                        </a>
                    </Button>
                )}
                {customerEmail && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" asChild>
                        <a href={`mailto:${customerEmail}`} title="Email">
                            <Mail className="h-4 w-4 text-gray-500" />
                        </a>
                    </Button>
                )}
                {customerPhone && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" asChild>
                        <a href={`sms:${customerPhone}`} title="Text">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                        </a>
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-gray-100"
                    onClick={() => setCommunicationDialogOpen(true)}
                    title="Add Note"
                >
                    <FileText className="h-4 w-4 text-gray-500" />
                </Button>

                <div className="w-px h-4 bg-gray-200 mx-1" />

                <DeleteConsultationDialog
                    consultationId={consultationId}
                    customerName={customerName}
                    trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 text-gray-400" title="Delete">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    }
                />
            </div>

            <AddCommunicationDialog
                open={communicationDialogOpen}
                onOpenChange={setCommunicationDialogOpen}
                consultationId={consultationId}
            />
        </>
    )
}

