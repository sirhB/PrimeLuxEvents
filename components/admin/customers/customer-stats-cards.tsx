import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, TrendingUp, Award } from 'lucide-react'
import { formatCentsWithCommas } from '@/lib/format-money'

interface CustomerStatsProps {
    totalCustomers: number
    newThisMonth: number
    totalRevenue: number
    avgOrderValue: number
}

export function CustomerStatsCards({
    totalCustomers,
    newThisMonth,
    totalRevenue,
    avgOrderValue,
}: CustomerStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Total Customers
                    </CardTitle>
                    <Users className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {totalCustomers}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Unique customers
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        New This Month
                    </CardTitle>
                    <UserPlus className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {newThisMonth}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        First-time customers
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Total Revenue
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {formatCentsWithCommas(totalRevenue)}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Lifetime customer value
                    </p>
                </CardContent>
            </Card>
            <Card className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        Avg Order Value
                    </CardTitle>
                    <Award className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--dashboard-text)]">
                        {formatCentsWithCommas(avgOrderValue)}
                    </div>
                    <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Per transaction
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
