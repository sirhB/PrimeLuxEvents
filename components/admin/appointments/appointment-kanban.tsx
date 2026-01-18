'use client'

import React, { useState } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { AppointmentCard } from './appointment-card'
import { updateAppointmentStatus } from '@/app/admin/appointments/actions'
import { haptics } from '@/lib/utils/haptics'
import { toast } from 'sonner'

interface Appointment {
    id: string
    client_name: string
    client_email: string | null
    client_phone: string | null
    appointment_date: string
    appointment_time: string
    location: string | null
    notes: string | null
    status: 'scheduled' | 'completed' | 'cancelled'
    consultation_id: string | null
    created_at: string
}

interface AppointmentKanbanProps {
    appointments: Appointment[]
    onStatusChange: (id: string, newStatus: string) => void
}

const COLUMNS: { id: Appointment['status']; title: string }[] = [
    { id: 'scheduled', title: 'Scheduled' },
    { id: 'completed', title: 'Completed' },
    { id: 'cancelled', title: 'Cancelled' },
]

export function AppointmentKanban({ appointments, onStatusChange }: AppointmentKanbanProps) {
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)
        haptics.impact()
    }

    const handleDragOver = (event: DragOverEvent) => {
        // Handled by dnd-kit automatically for column switching
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const appointmentId = active.id as string
        const overId = over.id as string

        // Find the appointment and the column it was dropped into
        const appointment = appointments.find(a => a.id === appointmentId)
        if (!appointment) return

        // If dropped over a column or another card
        let newStatus: Appointment['status'] | undefined

        if (COLUMNS.some(c => c.id === overId)) {
            newStatus = overId as Appointment['status']
        } else {
            const overAppointment = appointments.find(a => a.id === overId)
            if (overAppointment) {
                newStatus = overAppointment.status
            }
        }

        if (newStatus && newStatus !== appointment.status) {
            haptics.notification('success')
            onStatusChange(appointmentId, newStatus)

            try {
                await updateAppointmentStatus(appointmentId, newStatus)
                toast.success(`Appointment marked as ${newStatus}`)
            } catch (error) {
                toast.error('Failed to update appointment status')
                // Rollback status change
                onStatusChange(appointmentId, appointment.status)
            }
        }
    }

    const activeAppointment = activeId ? appointments.find(a => a.id === activeId) : null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 h-full pb-6 overflow-x-auto custom-scrollbar">
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        appointments={appointments.filter(a => a.status === column.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeId && activeAppointment ? (
                    <div className="w-80 opacity-100 scale-105 shadow-2xl rotate-2 transition-transform duration-200">
                        <AppointmentCard appointment={activeAppointment} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
