'use client'

import React, { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
    Phone, Mail, Calendar, Users, MapPin,
    MessageSquare, ClipboardList, Clock,
    ArrowRight, User, DollarSign, Quote, ArrowLeft,
    StickyNote, Save
} from 'lucide-react'
import { type Consultation } from '@/components/admin/consultations/types'
import { LeadStageProgress } from '@/components/admin/consultations/lead-stage-progress'
import { LeadActionBar } from '@/components/admin/consultations/lead-action-bar'
import { format } from 'date-fns'
import { updateConsultation } from '@/app/admin/consultations/actions'
import { toast } from 'sonner'
import { ScheduleAppointmentDialog } from '@/components/admin/consultations/schedule-appointment-dialog'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface LeadDetailsPaneProps {
    lead: Consultation
    onBack?: () => void
}

export function LeadDetailsPane({ lead, onBack }: LeadDetailsPaneProps) {
    const [communications, setCommunications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [internalNote, setInternalNote] = useState(lead.internal_notes || '')
    const [isSavingNote, setIsSavingNote] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchCommunications()
        setInternalNote(lead.internal_notes || '')
    }, [lead.id, lead.internal_notes])

    const fetchCommunications = async () => {
        setIsLoading(true)
        const { data } = await supabase
            .from('consultation_communications')
            .select('*')
            .eq('consultation_id', lead.id)
            .order('created_at', { ascending: false })

        if (data) setCommunications(data)
        setIsLoading(false)
    }

    const handleSaveNote = async () => {
        if (internalNote === lead.internal_notes) return
        setIsSavingNote(true)
        try {
            const res = await updateConsultation(lead.id, { internal_notes: internalNote } as any)
            if (res.success) {
                toast.success('Internal note updated')
            } else {
                toast.error('Failed to update note')
            }
        } catch (error) {
            toast.error('Error updating note')
        } finally {
            setIsSavingNote(false)
        }
    }

    const getDisplayName = () => {
        if (lead.first_name || lead.last_name) {
            return [lead.first_name, lead.last_name].filter(Boolean).join(' ')
        }
        return lead.customer_name || 'Guest User'
    }

    return (
        <div className="flex flex-col h-full bg-black/40 relative">
            {/* Immersive Header */}
            <div className="p-6 md:p-8 pb-4 md:pb-6 border-b border-[var(--dashboard-border)] bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onBack}
                                    className="lg:hidden h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            )}
                            <LeadStageProgress currentStatus={lead.status} consultationId={lead.id} />
                        </div>

                        <div>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-2">
                                {getDisplayName()}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--dashboard-text-muted)]">
                                <span className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 opacity-70" />
                                    Submitted {format(new Date(lead.created_at), 'PPP')}
                                </span>
                                <span className="opacity-30">•</span>
                                <span className="flex items-center gap-2 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono text-xs">
                                    ID: {lead.id.slice(0, 8)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {lead.customer_phone && (
                            <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-[var(--dashboard-accent-gold)] hover:text-black transition-all hover:border-[var(--dashboard-accent-gold)]" asChild>
                                <a href={`tel:${lead.customer_phone}`}><Phone className="h-5 w-5" /></a>
                            </Button>
                        )}
                        {lead.customer_email && (
                            <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/10 bg-white/5 hover:bg-[var(--dashboard-accent-gold)] hover:text-black transition-all hover:border-[var(--dashboard-accent-gold)]" asChild>
                                <a href={`mailto:${lead.customer_email}`}><Mail className="h-5 w-5" /></a>
                            </Button>
                        )}
                        <div className="flex items-center gap-3">
                            <Button asChild className="h-12 px-6 rounded-2xl bg-[var(--dashboard-accent-gold)] text-black font-bold hover:bg-[var(--dashboard-accent-gold)]/90 shadow-lg shadow-[var(--dashboard-accent-gold)]/20 transition-all hover:scale-[1.02]">
                                <Link href={`/admin/orders/new?leadId=${lead.id}`}>
                                    Generate Quote
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 pb-32">
                    {/* Main Info Column */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* Event Specifications Card */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--dashboard-accent-gold)]/5 blur-3xl rounded-full" />

                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-2 mb-6">
                                <Calendar className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                Event Specifications
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Event Date</p>
                                    <p className="text-lg font-medium text-white">
                                        {lead.event_date ? format(new Date(lead.event_date), 'EEEE, MMM do, yyyy') : 'No date set'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Guest Count</p>
                                    <p className="text-lg font-medium text-white">{lead.number_of_guests || 'To be determined'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Budget Target</p>
                                    <p className="text-lg font-serif font-bold text-[var(--dashboard-accent-gold)]">
                                        {lead.budget_range ? `$${lead.budget_range.replace('-', ' - $')}` : 'Undisclosed'}
                                    </p>
                                </div>
                            </div>

                            {lead.message && (
                                <>
                                    <Separator className="my-6 bg-white/10" />
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Client Vision</p>
                                        <div className="bg-black/20 rounded-2xl p-6 border border-white/5 italic text-[15px] leading-relaxed text-white/90 font-serif">
                                            "{lead.message}"
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Activity Timeline */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center gap-2 px-2">
                                <ClipboardList className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                Interactive Timeline
                            </h3>

                            <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                                {communications.length === 0 && !isLoading ? (
                                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                                        <p className="text-sm text-[var(--dashboard-text-muted)] italic">No communications logged yet.</p>
                                    </div>
                                ) : (
                                    communications.map((item, i) => (
                                        <div key={item.id} className="relative group">
                                            {/* Timeline dot */}
                                            <div className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-black border-2 border-[var(--dashboard-accent-gold)] z-10 shadow-[0_0_8px_rgba(212,175,55,0.4)]" />

                                            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all duration-300 group-hover:translate-x-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <Badge variant="outline" className="bg-black/20 text-[10px] uppercase font-bold tracking-wider text-[var(--dashboard-accent-gold)] border-[var(--dashboard-accent-gold)]/20 px-2">
                                                        {item.type.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-[10px] text-[var(--dashboard-text-muted)] font-medium">
                                                        {format(new Date(item.created_at), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white/90 leading-relaxed font-medium">{item.content}</p>
                                                {item.notes && <p className="mt-2 text-xs text-[var(--dashboard-text-muted)] italic border-l-2 border-white/10 pl-3">{item.notes}</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* Contact Intel */}
                        <div className="bg-black/20 border border-white/10 rounded-3xl p-6 space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Contact Intelligence</h4>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <User className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-tighter">Full Name</p>
                                        <p className="text-sm font-medium text-white truncate">{getDisplayName()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                        <Mail className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-tighter">Primary Email</p>
                                        <p className="text-sm font-medium text-white truncate">{lead.customer_email || '—'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <Phone className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-tighter">Phone Number</p>
                                        <p className="text-sm font-medium text-white truncate">{lead.customer_phone || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Staff Collaboration / Internal Notes */}
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 flex items-center gap-2">
                                    <StickyNote className="h-3 w-3" />
                                    Staff Collaboration Note
                                </h4>
                                {internalNote !== (lead.internal_notes || '') && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-[10px] text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote}
                                    >
                                        <Save className="h-3 w-3 mr-1.5" />
                                        {isSavingNote ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                )}
                            </div>
                            <textarea
                                value={internalNote}
                                onChange={(e) => setInternalNote(e.target.value)}
                                placeholder="Add private staff notes, internal context, or reminders here..."
                                className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-sm text-white/80 placeholder:text-white/10 min-h-[120px] focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all resize-none font-sans"
                            />
                        </div>

                        {/* Quote Summary */}
                        <div className="bg-[var(--dashboard-accent-gold)]/5 border border-[var(--dashboard-accent-gold)]/20 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--dashboard-accent-gold)]/10 blur-2xl rounded-full" />

                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] flex items-center justify-between">
                                Quote Intelligence
                                <Quote className="h-3 w-3 opacity-30" />
                            </h4>

                            <div className="text-center py-6">
                                <p className="text-sm text-[var(--dashboard-text-muted)] italic">No quote has been generated for this lead yet.</p>
                                <Button variant="link" className="mt-2 text-[var(--dashboard-accent-gold)] h-auto p-0 font-bold text-xs uppercase tracking-wider">
                                    Start Quote Draft
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Bottom Floating Action Bar */}
            <LeadActionBar
                consultationId={lead.id}
                customerName={getDisplayName()}
                onActionPerformed={fetchCommunications}
            />
        </div>
    )
}
