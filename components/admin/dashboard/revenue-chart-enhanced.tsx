'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar, Loader2 } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { formatCentsWithCommas } from '@/lib/format-money'

interface ChartData {
    date: string
    revenue: number
    orders: number
    formattedDate: string
}

export function RevenueChartEnhanced() {
    const [data, setData] = useState<ChartData[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
            const startDate = subDays(new Date(), days)

            const { data: revenueData } = await supabase
                .from('view_revenue_daily')
                .select('*')
                .gte('date', startDate.toISOString().split('T')[0])
                .order('date', { ascending: true })

            if (revenueData) {
                const chartData = revenueData.map(d => ({
                    date: d.date,
                    revenue: d.total_revenue / 100,
                    orders: d.order_count || 0,
                    formattedDate: format(new Date(d.date), 'MMM dd')
                }))
                setData(chartData)
            }
            setLoading(false)
        }
        fetchData()
    }, [timeRange])

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
    const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)
    const avgDaily = data.length > 0 ? totalRevenue / data.length : 0

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-card p-4 rounded-2xl border border-[var(--dashboard-border)] shadow-2xl">
                    <p className="text-sm font-medium text-[var(--dashboard-text)] mb-2">
                        {payload[0].payload.formattedDate}
                    </p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-[var(--dashboard-text-muted)]">Revenue</span>
                            <span className="text-sm font-bold text-[var(--dashboard-accent-gold)]">
                                ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-xs text-[var(--dashboard-text-muted)]">Orders</span>
                            <span className="text-sm font-bold text-[var(--dashboard-accent-green)]">
                                {payload[0].payload.orders}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    if (loading) {
        return (
            <Card className="glass-card border-none rounded-3xl h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--dashboard-accent-gold)]" />
            </Card>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="glass-card border-none rounded-3xl overflow-hidden border border-[var(--dashboard-border)]">
                <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-[var(--dashboard-accent-gold)]/10">
                                <TrendingUp className="h-6 w-6 text-[var(--dashboard-accent-gold)]" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-serif font-light text-[var(--dashboard-text)]">
                                    Revenue Analytics
                                </CardTitle>
                                <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
                                    Track your revenue performance over time
                                </p>
                            </div>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex items-center gap-2 p-1 bg-[var(--dashboard-card-hover)] rounded-2xl">
                            {(['7d', '30d', '90d'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${timeRange === range
                                            ? 'bg-[var(--dashboard-accent-gold)] text-black shadow-lg'
                                            : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-[var(--dashboard-accent-gold)]/5 rounded-2xl p-4 border border-[var(--dashboard-accent-gold)]/10">
                            <p className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-1">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-serif font-bold text-[var(--dashboard-text)]">
                                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="bg-[var(--dashboard-accent-green)]/5 rounded-2xl p-4 border border-[var(--dashboard-accent-green)]/10">
                            <p className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-1">
                                Total Orders
                            </p>
                            <p className="text-2xl font-serif font-bold text-[var(--dashboard-text)]">
                                {totalOrders}
                            </p>
                        </div>
                        <div className="bg-[var(--dashboard-accent-blue)]/5 rounded-2xl p-4 border border-[var(--dashboard-accent-blue)]/10">
                            <p className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-1">
                                Daily Average
                            </p>
                            <p className="text-2xl font-serif font-bold text-[var(--dashboard-text)]">
                                ${avgDaily.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--dashboard-border)"
                                    opacity={0.3}
                                />
                                <XAxis
                                    dataKey="formattedDate"
                                    stroke="var(--dashboard-text-muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="var(--dashboard-text-muted)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#D4AF37"
                                    strokeWidth={3}
                                    fill="url(#revenueGradient)"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
