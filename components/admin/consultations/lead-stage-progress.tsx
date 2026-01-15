'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { type ConsultationStatus } from '@/components/admin/consultations/types'

interface LeadStageProgressProps {
    currentStatus: ConsultationStatus
    consultationId: string
}

const stages: { status: ConsultationStatus, label: string }[] = [
    { status: 'new_request', label: 'Inquiry' },
    { status: 'pending_response', label: 'Response' },
    { status: 'appointment_confirmed', label: 'Confirmed' },
    { status: 'completed', label: 'Closed' }
]

export function LeadStageProgress({ currentStatus, consultationId }: LeadStageProgressProps) {
    const [updating, setUpdating] = useState(false)
    const [localStatus, setLocalStatus] = useState(currentStatus)
    const supabase = createClient()

    React.useEffect(() => {
        setLocalStatus(currentStatus)
    }, [currentStatus])

    const handleStageClick = async (status: ConsultationStatus) => {
        if (status === localStatus || updating) return

        setUpdating(true)
        const { error } = await supabase
            .from('consultations')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', consultationId)

        if (error) {
            toast.error('Failed to update stage')
        } else {
            setLocalStatus(status)
            toast.success(`Moved to ${status.replace('_', ' ')}`)
            // We might want to trigger a parent refresh here, 
            // but for MVP local state is fine if the list isn't re-sorted immediately.
        }
        setUpdating(false)
    }

    const currentStageIndex = stages.findIndex(s => s.status === localStatus)

    return (
        <div className="flex items-center gap-1">
            {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex
                const isActive = index === currentStageIndex
                const isLast = index === stages.length - 1

                return (
                    <React.Fragment key={stage.status}>
                        <button
                            disabled={updating}
                            onClick={() => handleStageClick(stage.status)}
                            className={cn(
                                "relative group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300",
                                isActive
                                    ? "bg-[var(--dashboard-accent-gold)] border-[var(--dashboard-accent-gold)] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                                    : isCompleted
                                        ? "bg-white/10 border-white/20 text-white/90"
                                        : "bg-transparent border-white/5 text-white/30 hover:bg-white/5 hover:text-white/60"
                            )}
                        >
                            <div className={cn(
                                "h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold border shrink-0",
                                isActive
                                    ? "bg-black text-[var(--dashboard-accent-gold)] border-black"
                                    : isCompleted
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "bg-white/5 border-white/10"
                            )}>
                                {isCompleted ? <Check className="h-2.5 w-2.5" /> : index + 1}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{stage.label}</span>
                        </button>
                        {!isLast && (
                            <ArrowRight className={cn(
                                "h-3 w-3 transition-colors",
                                isCompleted ? "text-[var(--dashboard-accent-gold)]" : "text-white/10"
                            )} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}
