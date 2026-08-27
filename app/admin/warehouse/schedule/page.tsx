import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'

const WarehouseScheduleContent = dynamic(
    () =>
        import('@/components/admin/warehouse/warehouse-schedule-content').then(
            (mod) => mod.WarehouseScheduleContent
        )
)

export default async function WarehouseSchedulePage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const { date } = await searchParams
    const selectedDate = date || new Date().toISOString().split('T')[0]

    const supabase = await createClient()

    const { data: tasks } = await supabase
        .from('tasks')
        .select(`
            *,
            orders (
                id,
                customer_name,
                delivery_address,
                delivery_time,
                delivery_date
            )
        `)
        .eq('task_type', 'warehouse')
        .eq('due_date', selectedDate)
        .order('scheduled_start', { ascending: true, nullsFirst: false })

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user?.id || '')

    const roleIds = userRoles?.map((r) => r.role_id) || []

    const { data: shifts } = await supabase
        .from('staff_shifts')
        .select('user_id')
        .eq('shift_date', selectedDate)

    const staffOnShift = shifts?.map((s) => s.user_id) || []

    return (
        <div className="p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <WarehouseScheduleContent
                initialTasks={tasks || []}
                selectedDate={selectedDate}
                userId={user?.id}
                roleIds={roleIds}
                staffOnShift={staffOnShift}
            />
        </div>
    )
}
