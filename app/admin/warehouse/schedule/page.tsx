import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { AdminPage } from '@/components/admin/page-shell'
import {
    fetchStaffOnShift,
    fetchWarehouseScheduleTasks,
} from '@/lib/warehouse/schedule-queries'

const WarehouseScheduleContent = dynamic(
    () =>
        import('@/components/admin/warehouse/warehouse-schedule-content').then(
            (mod) => mod.WarehouseScheduleContent
        )
)

async function WarehouseScheduleLoader({
    selectedDate,
    from,
    to,
}: {
    selectedDate: string
    from?: string
    to?: string
}) {
    const supabase = await createClient()

    const tasks = await fetchWarehouseScheduleTasks(supabase, selectedDate, { from, to })

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user?.id || '')

    const roleIds = userRoles?.map((r) => r.role_id) || []
    const staffOnShift = await fetchStaffOnShift(supabase, selectedDate)

    return (
        <WarehouseScheduleContent
            initialTasks={tasks}
            selectedDate={selectedDate}
            rangeFrom={from}
            rangeTo={to}
            userId={user?.id}
            roleIds={roleIds}
            staffOnShift={staffOnShift}
        />
    )
}

export default async function WarehouseSchedulePage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string; from?: string; to?: string }>
}) {
    const { date, from, to } = await searchParams
    const selectedDate = date || from || new Date().toISOString().split('T')[0]

    return (
        <AdminPage>
            <Suspense
                fallback={
                    <div className="flex justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--dashboard-text-muted)]" />
                    </div>
                }
            >
                <WarehouseScheduleLoader selectedDate={selectedDate} from={from} to={to} />
            </Suspense>
        </AdminPage>
    )
}
