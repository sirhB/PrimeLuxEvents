'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateAppointmentDialog } from '@/components/admin/appointments/create-appointment-dialog'

export function CreateAppointmentButton() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6 gap-2 h-11 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
                <Plus className="h-4 w-4" />
                Create Appointment
            </Button>
            <CreateAppointmentDialog open={open} onOpenChange={setOpen} />
        </>
    )
}
