'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Mail, Calendar, MapPin, Search, Clock, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'

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

interface AppointmentsRailProps {
    appointments: Appointment[]
    selectedId: string | null
    onSelect: (id: string) => void
}

const statusGlows: Record<string, string> = {
    scheduled: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-blue-500/10 border-blue-500/20',
    completed: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-500/10 border-emerald-500/20',
    cancelled: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/10 border-red-500/20',
}

const statusColors: Record<string, string> = {
    scheduled: 'text-blue-400',
    completed: 'text-emerald-400',
    cancelled: 'text-red-400',
}

const statusDots: Record<string, string> = {
    scheduled: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    completed: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    cancelled: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
}

export function AppointmentsRail({ appointments, selectedId, onSelect }: AppointmentsRailProps) {
    const [search, setSearch] = React.useState('')

    const filteredAppointments = React.useMemo(() => {
        if (!search) return appointments
        const s = search.toLowerCase()
        return appointments.filter(a =>
            a.client_name.toLowerCase().includes(s) ||
            (a.client_email?.toLowerCase().includes(s)) ||
            (a.location?.toLowerCase().includes(s))
        )
    }, [appointments, search])

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy')
        } catch {
            return dateString
        }
    }

    return (
        <>
            <div className="p-4 border-b border-[var(--dashboard-border)] bg-black/20 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center justify-between">
                    Appointments List
                    <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] border border-white/5">{appointments.length}</span>
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search appointments..."
                        className="pl-9 h-9 bg-black/40 border-white/10 rounded-xl text-xs focus-visible:ring-[var(--dashboard-accent-gold)]/50"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {filteredAppointments.map((appointment) => {
                        const isSelected = selectedId === appointment.id
                        const status = appointment.status

                        return (
                            <button
                                key={appointment.id}
                                onClick={() => onSelect(appointment.id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-2xl transition-all duration-300 border relative group",
                                    isSelected
                                        ? "bg-[var(--dashboard-accent-gold)]/10 border-[var(--dashboard-accent-gold)]/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                        : "bg-transparent border-transparent hover:bg-white/5",
                                    !isSelected && statusGlows[status]
                                )}
                            >
                                {/* Status Indicator */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-1.5 w-1.5 rounded-full", statusDots[status])} />
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", statusColors[status])}>
                                            {status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[var(--dashboard-accent-gold)] font-bold text-[10px] uppercase tracking-widest">
                                        <Clock className="h-3 w-3 opacity-50" />
                                        {appointment.appointment_time}
                                    </div>
                                </div>

                                <h4 className={cn(
                                    "font-serif text-lg leading-tight truncate mb-1 transition-colors",
                                    isSelected ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text)] group-hover:text-white"
                                )}>
                                    {appointment.client_name}
                                </h4>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] font-medium">
                                        <Calendar className="h-3 w-3 opacity-50" />
                                        {formatDate(appointment.appointment_date)}
                                    </div>
                                    {appointment.location && (
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] truncate opacity-70">
                                            <MapPin className="h-3 w-3 opacity-50" />
                                            {appointment.location}
                                        </div>
                                    )}
                                </div>

                                {/* Selection indicator line */}
                                {isSelected && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-[var(--dashboard-accent-gold)] shadow-[0_0_10px_rgba(212,175,55,1)]" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </>
    )
}
