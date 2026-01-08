'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MessageSquare, FileText, Trash2, MoreVertical, Plus } from 'lucide-react'
import { AddCommunicationDialog } from './add-communication-dialog'
import { DeleteConsultationDialog } from './delete-consultation-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

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
        <div className="flex items-center gap-1">
            <div className="flex bg-black/20 rounded-lg p-0.5 border border-[var(--dashboard-border)]/50">
                {customerPhone && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild>
                        <a href={`tel:${customerPhone}`} title="Call">
                            <Phone className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
                {customerEmail && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild>
                        <a href={`mailto:${customerEmail}`} title="Email">
                            <Mail className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
                {customerPhone && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild>
                        <a href={`sms:${customerPhone}`} title="Text">
                            <MessageSquare className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)] transition-colors">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-card border-[var(--dashboard-border)]">
                    <DropdownMenuItem
                        onClick={() => setCommunicationDialogOpen(true)}
                        className="gap-2 cursor-pointer focus:bg-[var(--dashboard-accent-gold)]/10 focus:text-[var(--dashboard-accent-gold)]"
                    >
                        <FileText className="h-4 w-4" />
                        <span>Add Communication</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />

                    <DeleteConsultationDialog
                        consultationId={consultationId}
                        customerName={customerName}
                        trigger={
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Lead</span>
                            </DropdownMenuItem>
                        }
                    />
                </DropdownMenuContent>
            </DropdownMenu>

            <AddCommunicationDialog
                open={communicationDialogOpen}
                onOpenChange={setCommunicationDialogOpen}
                consultationId={consultationId}
            />
        </div>
    )
}

