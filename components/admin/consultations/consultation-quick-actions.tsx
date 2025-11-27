'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MessageSquare, FileText, Calendar, Trash2 } from 'lucide-react'
import { DeleteConsultationDialog } from './delete-consultation-dialog'
import { AddCommunicationDialog } from './add-communication-dialog'
import { ScheduleAppointmentDialog } from './schedule-appointment-dialog'

interface ConsultationQuickActionsProps {
    consultationId: string
    customerName: string
    customerEmail?: string | null
    customerPhone?: string | null
}

export function ConsultationQuickActions({
    consultationId,
    customerName,
    customerEmail,
    customerPhone,
}: ConsultationQuickActionsProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false)
    const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {customerPhone && (
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                    >
                        <a href={`tel:${customerPhone}`}>
                            <Phone className="h-4 w-4" />
                            Call Client
                        </a>
                    </Button>
                )}
                {customerEmail && (
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                    >
                        <a href={`mailto:${customerEmail}`}>
                            <Mail className="h-4 w-4" />
                            Email Client
                        </a>
                    </Button>
                )}
                {customerPhone && (
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                    >
                        <a href={`sms:${customerPhone}`}>
                            <MessageSquare className="h-4 w-4" />
                            Text Client
                        </a>
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCommunicationDialogOpen(true)}
                    className="gap-2"
                >
                    <FileText className="h-4 w-4" />
                    Add Note
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppointmentDialogOpen(true)}
                    className="gap-2"
                >
                    <Calendar className="h-4 w-4" />
                    Schedule Appointment
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="gap-2"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            </div>

            <DeleteConsultationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                consultationId={consultationId}
                customerName={customerName}
            />

            <AddCommunicationDialog
                open={communicationDialogOpen}
                onOpenChange={setCommunicationDialogOpen}
                consultationId={consultationId}
            />

            <ScheduleAppointmentDialog
                open={appointmentDialogOpen}
                onOpenChange={setAppointmentDialogOpen}
                consultationId={consultationId}
                clientName={customerName}
                clientEmail={customerEmail}
                clientPhone={customerPhone}
            />
        </>
    )
}

