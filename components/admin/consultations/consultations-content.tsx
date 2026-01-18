'use client'

import nextDynamic from 'next/dynamic'
import { type Consultation } from '@/components/admin/consultations/types'

const LeadWorkspace = nextDynamic(() => import('@/components/admin/consultations/lead-workspace').then(m => m.LeadWorkspace), {
    loading: () => <div className="h-[600px] w-full animate-pulse bg-[var(--dashboard-card)] rounded-3xl" />,
    ssr: false
})

export function ConsultationsContent({ leads }: { leads: Consultation[] }) {
    return <LeadWorkspace initialLeads={leads} />
}
