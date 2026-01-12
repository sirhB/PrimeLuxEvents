import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, Layers, Archive } from 'lucide-react'

interface InventoryStatsProps {
    totalProducts: number
    totalUnits: number
    lowStockCount: number
    totalReserved: number
}

export function InventoryStatsCards({
    totalProducts,
    totalUnits,
    lowStockCount,
    totalReserved,
}: InventoryStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Total Products
                    </CardTitle>
                    <Package className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {totalProducts}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Unique items in catalog
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Total Units
                    </CardTitle>
                    <Layers className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {totalUnits}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Total physical assets
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Low Stock Alerts
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {lowStockCount}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Items with ≤ 2 available
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Reserved Units
                    </CardTitle>
                    <Archive className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {totalReserved}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Currently assigned to orders
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
