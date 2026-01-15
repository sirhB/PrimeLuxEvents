'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { type Consultation } from '@/components/admin/consultations/types'
import { DollarSign, Percent, TrendingUp, Clock } from 'lucide-react'

interface LeadInsightsProps {
    leads: Consultation[]
}

export function LeadInsights({ leads }: LeadInsightsProps) {
    const metrics = React.useMemo(() => {
        const activeLeads = leads.filter(l => l.status !== 'completed')
        const totalPipeline = activeLeads.reduce((sum, lead) => {
            // Very rough mapping of budget ranges to numbers for visualization
            const range = lead.budget_range || ''
            if (range === '20000+') return sum + 2000000 // 20k
            if (range === '10000-20000') return sum + 1500000 // 15k
            if (range === '5000-10000') return sum + 750000 // 7.5k
            if (range === '2500-5000') return sum + 375000 // 3.75k
            return sum + 100000 // 1k fallback
        }, 0)

        const converted = leads.filter(l => l.status === 'appointment_confirmed' || l.status === 'completed').length
        const conversionRate = leads.length > 0 ? (converted / leads.length) * 100 : 0

        const staleLeads = activeLeads.filter(l => {
            const updated = new Date(l.updated_at)
            const now = new Date()
            const diff = now.getTime() - updated.getTime()
            return diff > (1000 * 60 * 60 * 48) // 48 hours
        }).length

        return {
            activeCount: activeLeads.length,
            pipelineValue: totalPipeline,
            conversionRate,
            staleCount: staleLeads
        }
    }, [leads])

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(cents / 100)
    }

    const cards = [
        { label: 'Active Opportunities', value: metrics.activeCount, icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Pipeline Value', value: formatCurrency(metrics.pipelineValue), icon: DollarSign, color: 'text-[var(--dashboard-accent-gold)]' },
        { label: 'Conversion Health', value: `${metrics.conversionRate.toFixed(1)}%`, icon: Percent, color: 'text-emerald-400' },
        { label: 'Stale Leads', value: metrics.staleCount, icon: Clock, color: 'text-amber-400' },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {cards.map((card, i) => (
                <Card key={i} className="bg-black/20 border border-[var(--dashboard-border)] p-3 md:p-4 flex items-center gap-3 md:gap-4 relative overflow-hidden group">
                    {/* Animated background accent */}
                    <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-20", i === 1 ? 'bg-[var(--dashboard-accent-gold)]' : 'bg-white')} />

                    <div className={cn("h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0", card.color)}>
                        <card.icon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div>
                        <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] mb-0.5">{card.label}</p>
                        <p className="text-sm md:text-xl font-serif font-bold text-[var(--dashboard-text)] leading-none">{card.value}</p>
                    </div>
                </Card>
            ))}
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
