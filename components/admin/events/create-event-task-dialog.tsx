'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EventTaskForm } from './event-task-form'
import { Plus } from 'lucide-react'

interface CreateEventTaskDialogProps {
    eventId: string
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function CreateEventTaskDialog({ eventId, trigger, onSuccess }: CreateEventTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleSuccess = () => {
        setOpen(false)
        if (onSuccess) {
            onSuccess()
        } else {
            // If no onSuccess callback provided, refresh the page
            router.refresh()
        }
    }

    const handleCancel = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task or checklist item for this event.
                    </DialogDescription>
                </DialogHeader>
                <EventTaskForm
                    eventId={eventId}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    )
}
