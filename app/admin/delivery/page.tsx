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
        <div className="flex flex-col gap-6 p-6 bg-muted/30 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Delivery Planner</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Plan routes and manage delivery manifests
                    </p>
                </div>
            </div>

            <DeliveryRoutePlanner initialTasks={tasks || []} />
        </div>
    )
}
