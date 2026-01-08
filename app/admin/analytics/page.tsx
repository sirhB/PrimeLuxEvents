'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
    TrendingUp, DollarSign, ShoppingBag, Users, Calendar,
    ArrowUpRight, ArrowDownRight, Loader2, Download
} from 'lucide-react'
import { formatCents } from '@/lib/format-money'
import { Button } from '@/components/ui/button'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

const COLORS = ['#D4AF37', '#111111', '#444444', '#888888', '#AAAAAA']

export default function AnalyticsDashboard() {
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [statusData, setStatusData] = useState<any[]>([])
    const [popularData, setPopularData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true)
            const [revRes, statusRes, popularRes] = await Promise.all([
                supabase.from('view_revenue_daily').select('*').limit(30),
                supabase.from('view_order_status_distribution').select('*'),
                supabase.from('view_popular_items').select('*')
            ])

            if (revRes.data) {
                setRevenueData(revRes.data.map(d => ({
                    ...d,
                    formattedDate: format(new Date(d.date), 'MMM dd'),
                    revenue: d.total_revenue / 100 // Convert to dollars for display
                })))
            }
            if (statusRes.data) setStatusData(statusRes.data)
            if (popularRes.data) setPopularData(popularRes.data)
            setLoading(false)
        }
        fetchAnalytics()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Generating insights...</p>
            </div>
        )
    }

    const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.total_revenue, 0)
    const totalOrders = revenueData.reduce((acc, curr) => acc + curr.order_count, 0)

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-light tracking-tight">Intelligence Dashboard</h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest font-bold text-xs">Financial Performance & Trends</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl border-gray-200">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last 30 Days
                    </Button>
                    <Button size="sm" className="rounded-xl bg-black text-white hover:bg-gold hover:text-black">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: formatCents(totalRevenue), icon: DollarSign, trend: '+12.5%', isUp: true },
                    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, trend: '+5.2%', isUp: true },
                    { label: 'Avg Order Value', value: formatCents(totalOrders ? totalRevenue / totalOrders : 0), icon: TrendingUp, trend: '-2.1%', isUp: false },
                    { label: 'Conversion Rate', value: '3.8%', icon: Users, trend: '+0.8%', isUp: true }
                ].map((metric, i) => (
                    <Card key={i} className="rounded-3xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                                    <metric.icon className="h-5 w-5 text-gray-400 group-hover:text-gold" />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${metric.isUp ? 'text-green-600' : 'text-red-600'}`}>
                                    {metric.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {metric.trend}
                                </div>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{metric.label}</p>
                            <p className="text-2xl font-serif">{metric.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Revenue Line Chart */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-xl font-serif">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                    <XAxis
                                        dataKey="formattedDate"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888' }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#D4AF37"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRev)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Pie Chart */}
                <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-xl font-serif">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Items bar Chart */}
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-serif">Most Popular Inventory</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={popularData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#444', fontWeight: '500' }}
                                    width={150}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#F9F9F9' }}
                                />
                                <Bar
                                    dataKey="total_rented"
                                    fill="#111111"
                                    radius={[0, 10, 10, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
