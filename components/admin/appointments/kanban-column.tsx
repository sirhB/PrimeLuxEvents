'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AppointmentCard } from './appointment-card'
import { cn } from '@/lib/utils'

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

interface KanbanColumnProps {
    id: string
    title: string
    appointments: Appointment[]
}

export function KanbanColumn({ id, title, appointments }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col w-80 shrink-0 rounded-2xl bg-black/20 border border-white/5 transition-colors duration-200",
                isOver && "bg-black/40 border-[var(--dashboard-accent-gold)]/30 shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]"
            )}
        >
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--dashboard-accent-gold)] shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                    {title}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-[var(--dashboard-text-muted)] border border-white/5">
                    {appointments.length}
                </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar min-h-[300px]">
                <SortableContext
                    items={appointments.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {appointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))}
                </SortableContext>

                {appointments.length === 0 && (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-[var(--dashboard-text-muted)] text-xs font-light italic opacity-20">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    )
}
