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
                    <Button className="bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium rounded-full px-6 transition-all shadow-lg hover:shadow-[var(--dashboard-accent-gold)]/20">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-[var(--dashboard-background)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] p-0 overflow-hidden rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif font-light text-[var(--dashboard-text)]">Create New Task</DialogTitle>
                        <DialogDescription className="text-[var(--dashboard-text-muted)]">
                            Define a new operational task for the team.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                <div className="p-6">
                    <TaskForm
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
