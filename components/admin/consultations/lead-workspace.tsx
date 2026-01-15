'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LeadRail } from '@/components/admin/consultations/lead-rail'
import { LeadDetailsPane } from '@/components/admin/consultations/lead-details-pane'
import { LeadInsights } from '@/components/admin/consultations/lead-insights'
import { type Consultation, type ConsultationStatus } from '@/components/admin/consultations/types'
import { createClient } from '@/lib/supabase/client' // Assuming this import path

interface LeadWorkspaceProps {
    initialLeads: Consultation[]
}

export function LeadWorkspace({ initialLeads }: LeadWorkspaceProps) {
    const [leads, setLeads] = useState<Consultation[]>(initialLeads)
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeads[0]?.id || null)
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('lead-workspace-sync')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'consultations'
            }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setLeads(prev => prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new as Consultation } : l))
                } else if (payload.eventType === 'INSERT') {
                    setLeads(prev => [payload.new as Consultation, ...prev])
                } else if (payload.eventType === 'DELETE') {
                    setLeads(prev => prev.filter(l => l.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const selectedLead = useMemo(() =>
        leads.find(l => l.id === selectedLeadId),
        [leads, selectedLeadId])

    return (
        <div className="flex flex-col gap-4 md:gap-6 h-[900px] md:h-[calc(100vh-160px)] min-h-[500px]">
            {/* Top Insights Dashboard */}
            <div>
                <LeadInsights leads={leads} />
            </div>

            <div className="flex flex-1 gap-6 min-h-0 relative">
                {/* Left Side: Lead Rail */}
                <Card className={cn(
                    "flex flex-col border-none glass-card overflow-hidden bg-black/40 transition-all duration-300",
                    "w-full lg:w-80 xl:w-96",
                    selectedLeadId ? "hidden lg:flex" : "flex"
                )}>
                    <LeadRail
                        leads={leads}
                        selectedId={selectedLeadId}
                        onSelect={setSelectedLeadId}
                    />
                </Card>

                {/* Right Side: Immersive Details */}
                <Card className={cn(
                    "flex-1 flex flex-col border-none glass-card overflow-hidden relative bg-black/40 transition-all duration-300",
                    selectedLeadId ? "flex" : "hidden lg:flex"
                )}>
                    {selectedLead ? (
                        <LeadDetailsPane
                            lead={selectedLead}
                            onBack={() => setSelectedLeadId(null)}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[var(--dashboard-text-muted)]">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                <span className="text-2xl opacity-50">✦</span>
                            </div>
                            <h3 className="text-xl font-serif font-medium text-[var(--dashboard-text)] mb-2">No Lead Selected</h3>
                            <p className="max-w-xs mx-auto text-sm opacity-70">
                                Select a lead from the rail on the left to view full dossier and manage workflow.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
