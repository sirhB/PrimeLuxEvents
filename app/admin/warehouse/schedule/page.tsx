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

async function WarehouseScheduleLoader({ selectedDate }: { selectedDate: string }) {
    const supabase = await createClient()

    const tasks = await fetchWarehouseScheduleTasks(supabase, selectedDate)

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
            userId={user?.id}
            roleIds={roleIds}
            staffOnShift={staffOnShift}
        />
    )
}

export default async function WarehouseSchedulePage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const { date } = await searchParams
    const selectedDate = date || new Date().toISOString().split('T')[0]

    return (
        <AdminPage>
            <Suspense
                fallback={
                    <div className="flex justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--dashboard-text-muted)]" />
                    </div>
                }
            >
                <WarehouseScheduleLoader selectedDate={selectedDate} />
            </Suspense>
        </AdminPage>
    )
}
