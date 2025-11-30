'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EventForm } from './event-form'
import { Plus } from 'lucide-react'

interface CreateEventDialogProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function CreateEventDialog({ trigger, onSuccess }: CreateEventDialogProps) {
    const [open, setOpen] = useState(false)

    const handleSuccess = () => {
        setOpen(false)
        onSuccess?.()
    }

    const handleCancel = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[var(--dashboard-accent-purple)] hover:bg-[var(--dashboard-accent-purple)]/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add new Event
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new event. Required fields are marked with an asterisk (*).
                    </DialogDescription>
                </DialogHeader>
                <EventForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </DialogContent>
        </Dialog>
    )
}
