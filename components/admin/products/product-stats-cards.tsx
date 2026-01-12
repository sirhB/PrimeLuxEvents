import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react'
import { formatCents } from '@/lib/format-money'

interface ProductStatsProps {
    totalProducts: number
    lowStockCount: number
    totalValue: number
    categoriesCount: number
}

export function ProductStatsCards({
    totalProducts,
    lowStockCount,
    totalValue,
    categoriesCount,
}: ProductStatsProps) {
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
                        In catalog
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Low Stock
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {lowStockCount}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Needs attention
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Catalog Value
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {formatCents(totalValue)}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Total inventory value
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Categories
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {categoriesCount}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Product categories
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
