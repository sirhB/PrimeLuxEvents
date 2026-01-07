import { createClient } from '@/lib/supabase/server'
import { DeliveryRoutePlanner } from '@/components/admin/delivery/delivery-route-planner'

export default async function DeliveryPage() {
    const supabase = await createClient()

    // Fetch delivery tasks that are not completed (or completed today)
    // We might want to filter by date too, but for now just all pending deliveries
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

            <div className="animate-fade-in">
                <DeliveryRoutePlanner initialTasks={tasks || []} />
            </div>
        </div>
    )
}
