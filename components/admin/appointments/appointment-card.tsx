'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Calendar, Clock, MapPin, User, Mail } from 'lucide-react'
import { format } from 'date-fns'

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

interface AppointmentCardProps {
    appointment: Appointment
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: appointment.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy')
        } catch {
            return dateString
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative p-4 rounded-2xl border transition-all duration-300 cursor-grab active:cursor-grabbing",
                "bg-black/40 border-white/5 hover:border-[var(--dashboard-accent-gold)]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)]",
                isDragging && "opacity-50 !cursor-grabbing scale-95 shadow-2xl ring-2 ring-[var(--dashboard-accent-gold)]/50"
            )}
        >
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <h4 className="text-sm font-serif font-medium text-white group-hover:text-[var(--dashboard-accent-gold)] transition-colors">
                        {appointment.client_name}
                    </h4>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] font-medium">
                        <Calendar className="h-3 w-3 text-[var(--dashboard-accent-gold)]/50" />
                        {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)]">
                        <Clock className="h-3 w-3 opacity-70" />
                        {appointment.appointment_time}
                    </div>
                    {appointment.location && (
                        <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] truncate opacity-70">
                            <MapPin className="h-3 w-3 opacity-50" />
                            {appointment.location}
                        </div>
                    )}
                </div>

                {appointment.client_email && (
                    <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                        <Mail className="h-3 w-3 text-[var(--dashboard-text-muted)]" />
                        <span className="text-[10px] text-[var(--dashboard-text-muted)] truncate">{appointment.client_email}</span>
                    </div>
                )}
            </div>

            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--dashboard-accent-gold)]/0 to-[var(--dashboard-accent-gold)]/0 group-hover:from-[var(--dashboard-accent-gold)]/[0.02] group-hover:to-transparent transition-all duration-500 pointer-events-none" />
        </div>
    )
}
