'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateAppointmentDialog } from '@/components/admin/appointments/create-appointment-dialog'

export function CreateAppointmentButton() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Appointment
            </Button>
            <CreateAppointmentDialog open={open} onOpenChange={setOpen} />
        </>
    )
}

