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
            <div className="flex flex-wrap gap-1">
                {customerPhone && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={`tel:${customerPhone}`} title="Call">
                            <Phone className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
                {customerEmail && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={`mailto:${customerEmail}`} title="Email">
                            <Mail className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
                {customerPhone && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <a href={`sms:${customerPhone}`} title="Text">
                            <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCommunicationDialogOpen(true)}
                    title="Add Note"
                >
                    <FileText className="h-3.5 w-3.5" />
                </Button>
            </div>

            <DeleteConsultationDialog
                consultationId={consultationId}
                customerName={customerName}
                trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                }
            />

            <AddCommunicationDialog
                open={communicationDialogOpen}
                onOpenChange={setCommunicationDialogOpen}
                consultationId={consultationId}
            />
        </>
    )
}

