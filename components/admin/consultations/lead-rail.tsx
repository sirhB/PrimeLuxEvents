'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Mail, Calendar, Users, Star, AlertCircle, Search } from 'lucide-react'
import { type Consultation, type ConsultationStatus } from '@/components/admin/consultations/types'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'

interface LeadRailProps {
    leads: Consultation[]
    selectedId: string | null
    onSelect: (id: string) => void
}

const statusGlows: Record<ConsultationStatus, string> = {
    new_request: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-blue-500/10 border-blue-500/20',
    pending_response: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/10 border-amber-500/20',
    appointment_confirmed: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-500/10 border-emerald-500/20',
    completed: 'hover:shadow-[0_0_15px_rgba(148,163,184,0.15)] bg-slate-500/10 border-slate-500/20',
}

const statusColors: Record<ConsultationStatus, string> = {
    new_request: 'text-blue-400',
    pending_response: 'text-amber-400',
    appointment_confirmed: 'text-emerald-400',
    completed: 'text-slate-400',
}

const statusDots: Record<ConsultationStatus, string> = {
    new_request: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    pending_response: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    appointment_confirmed: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    completed: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)]',
}

export function LeadRail({ leads, selectedId, onSelect }: LeadRailProps) {
    const [search, setSearch] = React.useState('')

    const getDisplayName = (lead: Consultation) => {
        if (lead.first_name || lead.last_name) {
            return [lead.first_name, lead.last_name].filter(Boolean).join(' ')
        }
        return lead.customer_name || 'Guest User'
    }

    const filteredLeads = React.useMemo(() => {
        if (!search) return leads
        const s = search.toLowerCase()
        return leads.filter(l =>
            getDisplayName(l).toLowerCase().includes(s) ||
            (l.customer_email?.toLowerCase().includes(s)) ||
            (l.id.toLowerCase().includes(s))
        )
    }, [leads, search])

    const isHighValue = (budget?: string | null) => {
        return budget === '10000-20000' || budget === '20000+'
    }

    const isUrgent = (date?: string | null) => {
        if (!date) return false
        const eventDate = new Date(date)
        const now = new Date()
        const diff = eventDate.getTime() - now.getTime()
        const days = diff / (1000 * 60 * 60 * 24)
        return days > 0 && days < 30
    }

    return (
        <>
            <div className="p-4 border-b border-[var(--dashboard-border)] bg-black/20 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center justify-between">
                    Leads List
                    <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] border border-white/5">{leads.length}</span>
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search leads..."
                        className="pl-9 h-9 bg-black/40 border-white/10 rounded-xl text-xs focus-visible:ring-[var(--dashboard-accent-gold)]/50"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {filteredLeads.map((lead) => {
                        const isSelected = selectedId === lead.id
                        const highValue = isHighValue(lead.budget_range)
                        const urgent = isUrgent(lead.event_date)

                        return (
                            <button
                                key={lead.id}
                                onClick={() => onSelect(lead.id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-2xl transition-all duration-300 border relative group",
                                    isSelected
                                        ? "bg-[var(--dashboard-accent-gold)]/10 border-[var(--dashboard-accent-gold)]/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                        : "bg-transparent border-transparent hover:bg-white/5",
                                    !isSelected && statusGlows[lead.status]
                                )}
                            >
                                {/* Status Indicator */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-1.5 w-1.5 rounded-full", statusDots[lead.status])} />
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", statusColors[lead.status])}>
                                            {lead.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {highValue && (
                                            <div className="h-5 w-5 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20" title="High Value Opportunity">
                                                <Star className="h-3 w-3 text-amber-500 fill-amber-500/20" />
                                            </div>
                                        )}
                                        {urgent && (
                                            <div className="h-5 w-5 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20" title="Urgent: Upcoming Event">
                                                <AlertCircle className="h-3 w-3 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h4 className={cn(
                                    "font-serif text-lg leading-tight truncate mb-1 transition-colors",
                                    isSelected ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text)] group-hover:text-white"
                                )}>
                                    {getDisplayName(lead)}
                                </h4>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] font-medium">
                                        <Calendar className="h-3 w-3 opacity-50" />
                                        {lead.event_date ? format(new Date(lead.event_date), 'MMM d, yyyy') : 'Date TBD'}
                                    </div>
                                    {lead.customer_email && (
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] truncate opacity-70">
                                            <Mail className="h-3 w-3 opacity-50" />
                                            {lead.customer_email}
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
