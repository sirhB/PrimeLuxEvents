'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCentsWithCommas } from '@/lib/format-money'
import { cn } from '@/lib/utils'

interface MetricCardProps {
    title: string
    value: string | number
    change: number
    changeLabel: string
    icon: React.ElementType
    color: 'gold' | 'green' | 'blue' | 'purple'
    index: number
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, color, index }: MetricCardProps) {
    const isPositive = change >= 0

    const colorClasses = {
        gold: {
            bg: 'bg-[var(--dashboard-accent-gold)]/10',
            text: 'text-[var(--dashboard-accent-gold)]',
            border: 'border-[var(--dashboard-accent-gold)]/20',
            glow: 'shadow-[0_0_30px_rgba(212,175,55,0.15)]'
        },
        green: {
            bg: 'bg-[var(--dashboard-accent-green)]/10',
            text: 'text-[var(--dashboard-accent-green)]',
            border: 'border-[var(--dashboard-accent-green)]/20',
            glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]'
        },
        blue: {
            bg: 'bg-[var(--dashboard-accent-blue)]/10',
            text: 'text-[var(--dashboard-accent-blue)]',
            border: 'border-[var(--dashboard-accent-blue)]/20',
            glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]'
        },
        purple: {
            bg: 'bg-purple-500/10',
            text: 'text-purple-400',
            border: 'border-purple-500/20',
            glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]'
        }
    }

    const colors = colorClasses[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={cn(
                "relative glass-card rounded-3xl p-6 overflow-hidden group hover:scale-[1.02] transition-all duration-300 border",
                colors.border,
                colors.glow
            )}
        >
            {/* Background gradient effect */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", colors.bg)} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className={cn("p-3 rounded-2xl", colors.bg, colors.text)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                        isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(change)}%
                    </div>
                </div>

                {/* Value */}
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">
                        {title}
                    </h3>
                    <p className="text-4xl font-serif font-light text-[var(--dashboard-text)] tabular-nums">
                        {value}
                    </p>
                    <p className="text-xs text-[var(--dashboard-text-muted)] font-medium">
                        {changeLabel}
                    </p>
                </div>
            </div>

            {/* Decorative corner accent */}
            <div className={cn(
                "absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150",
                colors.bg
            )} />
        </motion.div>
    )
}

export function MetricsOverview() {
    const [metrics, setMetrics] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        events: 0,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        eventsChange: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchMetrics() {
            try {
                // Get current month revenue
                const now = new Date()
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

                // Current month revenue
                const { data: currentRevenue } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .gte('created_at', firstDayOfMonth.toISOString())

                // Last month revenue
                const { data: lastMonthRevenue } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .gte('created_at', lastMonth.toISOString())
                    .lte('created_at', lastMonthEnd.toISOString())

                const currentTotal = currentRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0
                const lastTotal = lastMonthRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0
                const revenueChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0

                // Current month orders
                const { data: currentOrders } = await supabase
                    .from('orders')
                    .select('id')
                    .gte('created_at', firstDayOfMonth.toISOString())

                const { data: lastMonthOrders } = await supabase
                    .from('orders')
                    .select('id')
                    .gte('created_at', lastMonth.toISOString())
                    .lte('created_at', lastMonthEnd.toISOString())

                const ordersChange = lastMonthOrders?.length
                    ? ((currentOrders?.length || 0) - lastMonthOrders.length) / lastMonthOrders.length * 100
                    : 0

                // Total customers
                const { count: customersCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'planner')

                // Upcoming events (next 30 days)
                const thirtyDaysFromNow = new Date()
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

                const { data: upcomingEvents } = await supabase
                    .from('orders')
                    .select('id')
                    .not('delivery_time', 'is', null)
                    .gte('delivery_time', now.toISOString())
                    .lte('delivery_time', thirtyDaysFromNow.toISOString())

                setMetrics({
                    revenue: currentTotal,
                    orders: currentOrders?.length || 0,
                    customers: customersCount || 0,
                    events: upcomingEvents?.length || 0,
                    revenueChange: Math.round(revenueChange),
                    ordersChange: Math.round(ordersChange),
                    customersChange: 12, // Mock data
                    eventsChange: 8 // Mock data
                })
            } catch (error) {
                console.error('Error fetching metrics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card rounded-3xl h-[180px] animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MetricCard
                title="Total Revenue"
                value={formatCentsWithCommas(metrics.revenue)}
                change={metrics.revenueChange}
                changeLabel="vs last month"
                icon={DollarSign}
                color="gold"
                index={0}
            />
            <MetricCard
                title="Total Orders"
                value={metrics.orders}
                change={metrics.ordersChange}
                changeLabel="vs last month"
                icon={ShoppingBag}
                color="green"
                index={1}
            />
            <MetricCard
                title="Active Customers"
                value={metrics.customers}
                change={metrics.customersChange}
                changeLabel="new this month"
                icon={Users}
                color="blue"
                index={2}
            />
            <MetricCard
                title="Upcoming Events"
                value={metrics.events}
                change={metrics.eventsChange}
                changeLabel="next 30 days"
                icon={Calendar}
                color="purple"
                index={3}
            />
        </div>
    )
}
