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
import { deleteAppointment } from '@/app/admin/appointments/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteAppointmentDialogProps {
    appointmentId: string
    clientName: string
}

export function DeleteAppointmentDialog({ appointmentId, clientName }: DeleteAppointmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setIsDeleting(true)
        try {
            await deleteAppointment(appointmentId)
            toast.success('Appointment deleted successfully')
            router.push('/admin/appointments')
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete appointment')
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the appointment for{' '}
                        <span className="font-semibold">{clientName}</span>? This action cannot be undone.
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

