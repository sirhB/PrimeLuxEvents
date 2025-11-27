'use client'

import { createClient } from '@/lib/supabase/client'
import { StatsCard } from '@/components/admin/dashboard/stats-card'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { RecentActivityList } from '@/components/admin/dashboard/recent-activity-list'
import { PromoCard } from '@/components/admin/dashboard/promo-card'
import { Box, ClipboardList, XCircle, Trophy, CalendarCheck2 } from 'lucide-react'
import { formatCents } from '@/lib/format-money'
import { useEffect, useState } from 'react'

export default function AdminDashboardPage() {
    const supabase = createClient()
    const [data, setData] = useState<{
        totalRevenue: number
        orderCount: number
        newRequestCount: number
        pendingResponseCount: number
        confirmedCount: number
        lowStockProducts: number
        recentOrders: any[]
    }>({
        totalRevenue: 0,
        orderCount: 0,
        newRequestCount: 0,
        pendingResponseCount: 0,
        confirmedCount: 0,
        lowStockProducts: 0,
        recentOrders: []
    })

    const [userName, setUserName] = useState("Admin")

    useEffect(() => {
        async function fetchData() {
            // Fetch user
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Admin"
                setUserName(name)
            }

            // Fetch real data
            const { data: orders } = await supabase
                .from('orders')
                .select('total_amount, created_at')
                .order('created_at', { ascending: false })

            const { data: consultations } = await supabase
                .from('consultations')
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
            const newRequestCount = consultations?.filter((c) => c.status === 'new_request').length || 0
            const pendingResponseCount = consultations?.filter((c) => c.status === 'pending_response').length || 0
            const confirmedCount = consultations?.filter((c) => c.status === 'appointment_confirmed').length || 0
            const lowStockProducts =
                products?.filter((p) => p.quantity_available - p.quantity_reserved <= 2).length || 0

            setData({
                totalRevenue,
                orderCount,
                newRequestCount,
                pendingResponseCount,
                confirmedCount,
                lowStockProducts,
                recentOrders: recentOrders || []
            })
        }

        fetchData()
    }, [])

    // Prepare chart data
    const revenueData = [
        { name: 'Jan', total: data.totalRevenue * 0.1 },
        { name: 'Feb', total: data.totalRevenue * 0.15 },
        { name: 'Mar', total: data.totalRevenue * 0.12 },
        { name: 'Apr', total: data.totalRevenue * 0.2 },
        { name: 'May', total: data.totalRevenue * 0.18 },
        { name: 'Jun', total: data.totalRevenue * 0.25 },
        { name: 'Jul', total: data.totalRevenue * 0.22 },
        { name: 'Aug', total: data.totalRevenue * 0.3 },
        { name: 'Sep', total: data.totalRevenue * 0.28 },
        { name: 'Oct', total: data.totalRevenue * 0.35 },
        { name: 'Nov', total: data.totalRevenue * 0.32 },
        { name: 'Dec', total: data.totalRevenue * 0.4 },
    ]

    return (
        <div className="flex flex-col gap-6 p-6 bg-[var(--dashboard-background)] min-h-screen">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--dashboard-text)] font-serif">Welcome back, {userName}!</h1>
                    <p className="text-[var(--dashboard-text-muted)] font-sans">Here's what's happening with your store today</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                        <CalendarCheck2 className="h-4 w-4 text-[var(--dashboard-text-muted)]" />
                        <span className="text-sm font-medium">
                            {new Date().toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total products"
                    value={data.lowStockProducts + 120} // Mock total
                    subtitle="+2.5%"
                    icon={Box}
                    index={0}
                />
                <StatsCard
                    title="Completed order"
                    value={data.orderCount}
                    subtitle="+2.5%"
                    icon={ClipboardList}
                    index={1}
                />
                <StatsCard
                    title="Canceled order"
                    value={14} // Mock
                    subtitle="-1.5%"
                    icon={XCircle}
                    index={2}
                />
                <StatsCard
                    title="Top products"
                    value={119} // Mock
                    subtitle="+2.5%"
                    icon={Trophy}
                    index={3}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column (Charts) */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    <div className="h-[400px]">
                        <RevenueChart data={revenueData} />
                    </div>
                    <div className="h-full">
                        <RecentActivityList orders={data.recentOrders} />
                    </div>
                </div>

                {/* Right Column (Promo & Extra) */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    <div className="h-[400px]">
                        <PromoCard />
                    </div>
                </div>
            </div>
        </div>
    )
}
