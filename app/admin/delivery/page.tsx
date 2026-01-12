import { createClient } from '@/lib/supabase/server'
import { DeliveryRoutePlanner } from '@/components/admin/delivery/delivery-route-planner'
import { DeliveryStatsCards } from '@/components/admin/delivery/delivery-stats-cards'

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
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Logistics
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Delivery Planner
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Optimize routes and manage distribution logistics.
                    </p>
                </div>
            </div>

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
        </div>
    )
}

