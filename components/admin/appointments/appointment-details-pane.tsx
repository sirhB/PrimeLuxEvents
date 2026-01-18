'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Mail,
    Phone,
    ArrowLeft,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Info,
    CalendarCheck,
    History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { haptics } from '@/lib/utils/haptics'
import { AppointmentEditForm } from './appointment-edit-form'
import Link from 'next/link'

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

interface AppointmentDetailsPaneProps {
    appointment: Appointment
    onBack?: () => void
}

const statusIcons = {
    scheduled: <CalendarCheck className="h-5 w-5 text-blue-400" />,
    completed: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    cancelled: <XCircle className="h-5 w-5 text-red-400" />,
}

const statusGlows = {
    scheduled: 'shadow-[0_0_20px_rgba(59,130,246,0.2)] border-blue-500/30 bg-blue-500/5',
    completed: 'shadow-[0_0_20px_rgba(16,185,129,0.2)] border-emerald-500/30 bg-emerald-500/5',
    cancelled: 'shadow-[0_0_20px_rgba(239,68,68,0.2)] border-red-500/30 bg-red-500/5',
}

export function AppointmentDetailsPane({ appointment, onBack }: AppointmentDetailsPaneProps) {
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'EEEE, MMMM do, yyyy')
        } catch {
            return dateString
        }
    }

    return (
        <div className="flex flex-col h-full bg-black/40">
            {/* Immersive Header */}
            <div className={cn(
                "p-6 md:p-8 border-b border-white/10 transition-all duration-500",
                statusGlows[appointment.status]
            )}>
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                haptics.impact()
                                onBack?.()
                            }}
                            className="lg:hidden -ml-2 text-[var(--dashboard-text-muted)] hover:text-white"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Badge className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border shadow-lg",
                            appointment.status === 'scheduled' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                            appointment.status === 'completed' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                            appointment.status === 'cancelled' && "bg-red-500/20 text-red-400 border-red-500/30"
                        )}>
                            {appointment.status}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
                            {appointment.client_name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-[var(--dashboard-text-muted)]">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                <Calendar className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                <span className="text-xs font-medium">{formatDate(appointment.appointment_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                <Clock className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                <span className="text-xs font-bold uppercase tracking-widest">{appointment.appointment_time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 md:p-8 space-y-10">
                    {/* Main Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Client & Logistics */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-3 mb-6">
                                    <span className="w-8 h-[1px] bg-white/10"></span>
                                    Client & Contact Intelligence
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="glass-card p-4 rounded-2xl border-white/5 bg-white/[0.02] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--dashboard-accent-gold)]/10 border border-[var(--dashboard-accent-gold)]/20 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] mb-0.5">Email Address</p>
                                            <a href={`mailto:${appointment.client_email}`} className="text-sm font-medium hover:text-[var(--dashboard-accent-gold)] transition-colors">
                                                {appointment.client_email || 'No email provided'}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="glass-card p-4 rounded-2xl border-white/5 bg-white/[0.02] flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--dashboard-accent-gold)]/10 border border-[var(--dashboard-accent-gold)]/20 flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] mb-0.5">Phone Number</p>
                                            <p className="text-sm font-medium">{appointment.client_phone || 'No phone provided'}</p>
                                        </div>
                                    </div>
                                    {appointment.location && (
                                        <div className="glass-card p-4 rounded-2xl border-white/5 bg-white/[0.02] flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--dashboard-accent-gold)]/10 border border-[var(--dashboard-accent-gold)]/20 flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] mb-0.5">Location</p>
                                                <p className="text-sm font-medium">{appointment.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {appointment.consultation_id && (
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-3 mb-6">
                                        <span className="w-8 h-[1px] bg-white/10"></span>
                                        Related Context
                                    </h3>
                                    <Link
                                        href={`/admin/consultations/${appointment.consultation_id}`}
                                        className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[var(--dashboard-accent-gold)]/10 border border-[var(--dashboard-accent-gold)]/20 text-[var(--dashboard-accent-gold)] group hover:bg-[var(--dashboard-accent-gold)]/20 transition-all duration-300 w-full"
                                    >
                                        <CalendarCheck className="h-5 w-5" />
                                        <div className="flex-1 text-left">
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Linked Consultation</p>
                                            <p className="text-sm font-medium">View detailed lead dossier</p>
                                        </div>
                                        <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </section>
                            )}

                            {appointment.notes && (
                                <section>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-3 mb-6">
                                        <span className="w-8 h-[1px] bg-white/10"></span>
                                        Special Instructions
                                    </h3>
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                        <Info className="absolute -right-4 -top-4 h-24 w-24 text-white/[0.03] rotate-12 transition-transform duration-500 group-hover:scale-110" />
                                        <p className="text-[var(--dashboard-text)] text-sm leading-relaxed relative z-10">
                                            {appointment.notes}
                                        </p>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Workflow Management */}
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-3 mb-6">
                                    <span className="w-8 h-[1px] bg-white/10"></span>
                                    Management Workflow
                                </h3>
                                <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.02]">
                                    <AppointmentEditForm appointment={appointment as any} />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-3 mb-6">
                                    <span className="w-8 h-[1px] bg-white/10"></span>
                                    Audit Intelligence
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <History className="h-4 w-4 text-[var(--dashboard-text-muted)]" />
                                            <span className="text-xs text-[var(--dashboard-text-muted)]">Entry Synchronized</span>
                                        </div>
                                        <span className="text-[10px] font-medium text-[var(--dashboard-text-muted)]">
                                            {format(new Date(appointment.created_at), 'MMM d, yyyy HH:mm')}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
