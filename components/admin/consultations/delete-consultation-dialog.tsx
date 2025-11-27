'use client'

import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteConsultation } from '@/app/admin/consultations/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteConsultationDialogProps {
    consultationId: string
    customerName: string
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DeleteConsultationDialog({
    consultationId,
    customerName,
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: DeleteConsultationDialogProps) {
    const router = useRouter()
    const [internalOpen, setInternalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = controlledOnOpenChange || setInternalOpen

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await deleteConsultation(consultationId)
            toast.success('Consultation deleted successfully')
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete consultation')
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Consultation</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the consultation for{' '}
                        <span className="font-semibold">{customerName}</span>? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
