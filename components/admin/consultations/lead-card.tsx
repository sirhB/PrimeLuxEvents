'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type Consultation } from './types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { User, Calendar, Clock } from 'lucide-react'

interface LeadCardProps {
    lead: Consultation
    isOverlay?: boolean
}

export function LeadCard({ lead, isOverlay }: LeadCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group p-4 rounded-xl glass-card border border-white/5 bg-black/40 cursor-grab active:cursor-grabbing hover:border-[var(--dashboard-accent-gold)]/30 transition-all",
                isDragging && "opacity-0",
                isOverlay && "cursor-grabbing border-[var(--dashboard-accent-gold)] shadow-2xl"
            )}
        >
            <div className="space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-[var(--dashboard-text)] group-hover:text-[var(--dashboard-accent-gold)] transition-colors">
                            {lead.customer_name || 'Unnamed Client'}
                        </h4>
                        <p className="text-[10px] text-[var(--dashboard-text-muted)] truncate max-w-[180px]">
                            {lead.customer_email}
                        </p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                        <User className="h-3 w-3 text-[var(--dashboard-text-muted)]" />
                    </div>
                </div>

                {lead.event_date && (
                    <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)]">
                        <Calendar className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
                        <span>{format(new Date(lead.event_date), 'MMM d, yyyy')}</span>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-widest opacity-60">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{format(new Date(lead.created_at), 'MMM d')}</span>
                    </div>
                    {lead.budget_range && (
                        <span className="text-[9px] font-bold text-[var(--dashboard-accent-gold)] bg-[var(--dashboard-accent-gold)]/10 px-1.5 py-0.5 rounded border border-[var(--dashboard-accent-gold)]/20">
                            {lead.budget_range}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
