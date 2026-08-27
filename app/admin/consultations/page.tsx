import { createClient } from '@/lib/supabase/server'
import { ConsultationsContent } from '@/components/admin/consultations/consultations-content'
import { type Consultation } from '@/components/admin/consultations/types'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export const dynamic = 'force-dynamic'

export default async function ConsultationsPage() {
    const supabase = await createClient()

    const { data } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })

    const leads = (data ?? []) as Consultation[]

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="CRM"
                title="Leads"
                description="High-touch management for your event inquiries. Focus on the details that matter."
            />

            <ConsultationsContent leads={leads} />
        </AdminPage>
    )
}
