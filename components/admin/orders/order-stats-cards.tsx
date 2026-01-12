import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, Clock, Truck } from 'lucide-react'
import { formatCents } from '@/lib/format-money'

interface OrderStatsProps {
    totalRevenue: number
    totalOrders: number
    pendingOrders: number
    deliveredOrders: number
}

export function OrderStatsCards({
    totalRevenue,
    totalOrders,
    pendingOrders,
    deliveredOrders,
}: OrderStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {formatCents(totalRevenue)}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Lifetime revenue
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Total Orders
                    </CardTitle>
                    <Package className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {totalOrders}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Lifetime orders
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Pending
                    </CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {pendingOrders}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Orders needing action
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Delivered
                    </CardTitle>
                    <Truck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {deliveredOrders}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Fully completed orders
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
