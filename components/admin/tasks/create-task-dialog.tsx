'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TaskForm } from './task-form'
import { Plus } from 'lucide-react'

interface CreateTaskDialogProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function CreateTaskDialog({ trigger, onSuccess }: CreateTaskDialogProps) {
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
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to the system.
                    </DialogDescription>
                </DialogHeader>
                <TaskForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    )
}
