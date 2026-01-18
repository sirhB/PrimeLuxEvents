'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { LayoutGrid, Columns2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { haptics } from '@/lib/utils/haptics'
import { AppointmentsRail } from './appointments-rail'
import { AppointmentKanban } from './appointment-kanban'

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

// Dynamic imports for heavy components
const AppointmentDetailsPane = dynamic<{
    appointment: Appointment;
    onBack?: () => void;
}>(() => import('./appointment-details-pane').then(m => m.AppointmentDetailsPane), {
    ssr: false,
    loading: () => <div className="flex-1 flex items-center justify-center bg-black/20 animate-pulse rounded-3xl" />
})

interface AppointmentsWorkspaceProps {
    initialAppointments: Appointment[]
}

export function AppointmentsWorkspace({ initialAppointments }: AppointmentsWorkspaceProps) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(initialAppointments[0]?.id || null)
    const [viewMode, setViewMode] = useState<'dossier' | 'pipeline'>('dossier')
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('appointment-workspace-sync')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'appointments'
            }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setAppointments(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new as Appointment } : a))
                } else if (payload.eventType === 'INSERT') {
                    setAppointments(prev => [payload.new as Appointment, ...prev])
                } else if (payload.eventType === 'DELETE') {
                    setAppointments(prev => prev.filter(a => a.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const selectedAppointment = useMemo(() =>
        appointments.find(a => a.id === selectedAppointmentId),
        [appointments, selectedAppointmentId])

    const handleStatusChange = (id: string, newStatus: string) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a))
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 h-[900px] md:h-[calc(100vh-160px)] min-h-[500px]">
            {/* View Toggle */}
            <div className="flex justify-end">
                <div className="flex items-center gap-1 p-1 bg-black/20 border border-white/5 rounded-2xl shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            haptics.impact()
                            setViewMode('dossier')
                        }}
                        className={cn(
                            "rounded-xl h-9 px-4 text-xs font-bold uppercase tracking-wider transition-all",
                            viewMode === 'dossier'
                                ? "bg-[var(--dashboard-accent-gold)] text-black shadow-lg"
                                : "text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]"
                        )}
                    >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Dossier
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            haptics.impact()
                            setViewMode('pipeline')
                        }}
                        className={cn(
                            "rounded-xl h-9 px-4 text-xs font-bold uppercase tracking-wider transition-all",
                            viewMode === 'pipeline'
                                ? "bg-[var(--dashboard-accent-gold)] text-black shadow-lg"
                                : "text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]"
                        )}
                    >
                        <Columns2 className="h-4 w-4 mr-2" />
                        Pipeline
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0 relative overflow-hidden">
                {viewMode === 'dossier' ? (
                    <>
                        {/* Left Side: Appointments Rail */}
                        <Card className={cn(
                            "flex flex-col border-none glass-card overflow-hidden bg-black/40 transition-all duration-300",
                            "w-full lg:w-80 xl:w-96",
                            selectedAppointmentId ? "hidden lg:flex" : "flex"
                        )}>
                            <AppointmentsRail
                                appointments={appointments}
                                selectedId={selectedAppointmentId}
                                onSelect={setSelectedAppointmentId}
                            />
                        </Card>

                        {/* Right Side: Immersive Details */}
                        <Card className={cn(
                            "flex-1 flex flex-col border-none glass-card overflow-hidden relative bg-black/40 transition-all duration-300",
                            selectedAppointmentId ? "flex" : "hidden lg:flex"
                        )}>
                            {selectedAppointment ? (
                                <AppointmentDetailsPane
                                    appointment={selectedAppointment}
                                    onBack={() => setSelectedAppointmentId(null)}
                                />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[var(--dashboard-text-muted)]">
                                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                        <span className="text-2xl opacity-50">✦</span>
                                    </div>
                                    <h3 className="text-xl font-serif font-medium text-[var(--dashboard-text)] mb-2">No Appointment Selected</h3>
                                    <p className="max-w-xs mx-auto text-sm opacity-70">
                                        Select an appointment from the rail on the left to view full details and manage workflow.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </>
                ) : (
                    <div className="flex-1 min-h-0">
                        <AppointmentKanban
                            appointments={appointments}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
