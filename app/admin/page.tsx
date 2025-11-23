import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/dashboard/stats-card'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { RecentActivityList } from '@/components/admin/dashboard/recent-activity-list'
import { QuickActionsCard } from '@/components/admin/dashboard/quick-actions-card'
import { MetricsTrendCard } from '@/components/admin/dashboard/metrics-trend-card'
import { DollarSign, ShoppingCart, FileText, AlertTriangle } from 'lucide-react'
import { formatCents } from '@/lib/format-money'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    // Fetch real data
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .order('created_at', { ascending: false })

    const { data: quotes } = await supabase
        .from('quotes')
        .select('status')

    const { data: products } = await supabase
        .from('products')
        .select('quantity_available, quantity_reserved')

    const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, customer_name, customer_email, total_amount, created_at')
        .order('created_at', { ascending: false })
        .limit(5)


    // Calculate metrics
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const orderCount = orders?.length || 0
    const pendingQuotes = quotes?.filter((q) => q.status === 'draft' || q.status === 'sent').length || 0
    const lowStockProducts =
        products?.filter((p) => p.quantity_available - p.quantity_reserved <= 2).length || 0

    // Prepare chart data (mocked for now based on real total, can be refined to be real daily data)
    // In a real scenario, we would aggregate orders by date.
    const revenueData = [
        { name: 'Mon', total: totalRevenue * 0.1 },
        { name: 'Tue', total: totalRevenue * 0.2 },
        { name: 'Wed', total: totalRevenue * 0.15 },
        { name: 'Thu', total: totalRevenue * 0.3 },
        { name: 'Fri', total: totalRevenue * 0.25 },
    ]

    const trendData = [
        { value: 10 },
        { value: 15 },
        { value: 12 },
        { value: 20 },
        { value: 18 },
        { value: 25 },
        { value: 22 },
        { value: 30 },
    ]

    return (
        <div className="flex flex-col gap-6">
            {/* Top Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={formatCents(totalRevenue)}
                    subtitle="All time"
                    icon={DollarSign}
                />
                <StatsCard
                    title="Total Orders"
                    value={orderCount}
                    subtitle="All time"
                    icon={ShoppingCart}
                />
                <StatsCard
                    title="Pending Quotes"
                    value={pendingQuotes}
                    subtitle="Awaiting response"
                    icon={FileText}
                />
                <StatsCard
                    title="Low Stock Alerts"
                    value={lowStockProducts}
                    subtitle="Products need attention"
                    icon={AlertTriangle}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column (Charts) */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    <div className="h-[300px]">
                        <RevenueChart data={revenueData} />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <MetricsTrendCard
                            title="Completed Tasks"
                            value={orderCount}
                            data={trendData}
                            trend="+10% today"
                        />
                        <QuickActionsCard />
                    </div>
                </div>

                {/* Right Column (Recent Activity) */}
                <div className="md:col-span-4">
                    <RecentActivityList orders={recentOrders || []} />
                </div>
            </div>
        </div>
    )
}
