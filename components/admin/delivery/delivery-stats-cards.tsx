import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Clock, CheckCircle, MapPin } from 'lucide-react'

interface DeliveryStatsProps {
    totalTasks: number
    pendingToday: number
    completedToday: number
    totalStops: number
}

export function DeliveryStatsCards({
    totalTasks,
    pendingToday,
    completedToday,
    totalStops,
}: DeliveryStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Total Tasks
                    </CardTitle>
                    <Truck className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {totalTasks}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Active deliveries
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Pending Today
                    </CardTitle>
                    <Clock className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {pendingToday}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Awaiting delivery
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Completed Today
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {completedToday}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Successfully delivered
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Route Stops
                    </CardTitle>
                    <MapPin className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {totalStops}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Planned locations
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
