import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import { AdminPage } from '@/components/admin/page-shell'

const AppointmentsContent = dynamic(
    () => import('@/components/admin/appointments/appointments-content').then(mod => mod.AppointmentsContent)
)

export default async function AppointmentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; status?: string }>
}) {
    const { page = '1', search, status } = await searchParams
    const supabase = await createClient()

    const currentPage = Math.max(parseInt(page) || 1, 1)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

    if (search) {
        query = query.or(
            `id.ilike.%${search}%,client_name.ilike.%${search}%,client_email.ilike.%${search}%,location.ilike.%${search}%`
        )
    }

    if (status) {
        query = query.eq('status', status)
    }

    const { data: appointments, count } = await query.range(start, end)

    return (
        <AdminPage>
            <AppointmentsContent
                appointments={appointments}
                count={count}
                start={start}
                end={end}
                currentPage={currentPage}
                pageSize={pageSize}
            />
        </AdminPage>
    )
}
