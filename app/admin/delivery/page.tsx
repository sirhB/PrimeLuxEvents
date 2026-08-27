import { createClient } from '@/lib/supabase/server'
import { DeliveryRoutePlanner } from '@/components/admin/delivery/delivery-route-planner'
import { DeliveryStatsCards } from '@/components/admin/delivery/delivery-stats-cards'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function DeliveryPage() {
    const supabase = await createClient()

    // Fetch delivery tasks that are not completed (or completed today)
    const { data: tasks } = await supabase
        .from('tasks')
        .select(`
            *,
            orders (
                id,
                customer_name,
                delivery_address,
                delivery_time
            )
        `)
        .eq('task_type', 'delivery')
        .neq('status', 'completed')
        .order('route_order', { ascending: true })
        .order('created_at', { ascending: false })

    // Fetch today's completed tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data: completedToday } = await supabase
        .from('tasks')
        .select('id')
        .eq('task_type', 'delivery')
        .eq('status', 'completed')
        .gte('updated_at', today.toISOString())

    // Calculate metrics
    const totalTasks = tasks?.length || 0
    const pendingToday = tasks?.filter(t => t.status === 'pending').length || 0
    const completedTodayCount = completedToday?.length || 0
    const totalStops = tasks?.filter(t => t.route_order !== null).length || 0

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Logistics"
                title="Delivery Planner"
                description="Optimize routes and manage distribution logistics."
            />

            {/* Dashboard Statistics */}
            <DeliveryStatsCards
                totalTasks={totalTasks}
                pendingToday={pendingToday}
                completedToday={completedTodayCount}
                totalStops={totalStops}
            />

            <div className="animate-fade-in">
                <DeliveryRoutePlanner initialTasks={tasks || []} />
            </div>
        </AdminPage>
    )
}

