'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Truck, MapPin, Calendar, Search, Filter, Map as MapIcon, List, Package } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/page-shell'

export function LogisticsContent() {
    const [orders, setOrders] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
    const supabase = createClient()

    useEffect(() => {
        async function fetchLogistics() {
            const dateStr = format(selectedDate, 'yyyy-MM-dd')
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('delivery_date', dateStr)
                .order('delivery_time', { ascending: true })

            if (data) setOrders(data)
        }
        fetchLogistics()
    }, [selectedDate])

    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                eyebrow="Logistics"
                title="Logistics Hub"
                description="Route optimization and deployment."
                actions={
                    <div className="flex bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] p-1 rounded-md">
                        <Button
                            variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('map')}
                            className="rounded-md px-4"
                        >
                            <MapIcon className="h-4 w-4 mr-2" />
                            Map
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-md px-4"
                        >
                            <List className="h-4 w-4 mr-2" />
                            Schedule
                        </Button>
                    </div>
                }
            />

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="rounded-3xl border-none glass-card overflow-hidden">
                        <CardHeader className="bg-black/20 border-b border-[var(--dashboard-border)] p-6">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[var(--dashboard-text)]">
                                <Calendar className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                Select Date
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <input
                                type="date"
                                value={format(selectedDate, 'yyyy-MM-dd')}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="w-full bg-black/10 border border-[var(--dashboard-border)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--dashboard-accent-gold)] outline-none text-[var(--dashboard-text)]"
                            />
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none glass-card overflow-hidden">
                        <CardHeader className="bg-black/20 border-b border-[var(--dashboard-border)] p-6">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[var(--dashboard-text)]">
                                <Truck className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                Today's Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--dashboard-text-muted)]">Deliveries</span>
                                <span className="font-bold text-[var(--dashboard-text)]">{orders.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--dashboard-text-muted)]">Completed</span>
                                <span className="font-bold text-[var(--dashboard-accent-green)]">0</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--dashboard-text-muted)]">In Progress</span>
                                <span className="font-bold text-blue-500">0</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none glass-card overflow-hidden border-[var(--dashboard-accent-gold)]/20 bg-[var(--dashboard-accent-gold)]/[0.02]">
                        <CardHeader className="bg-[var(--dashboard-accent-gold)]/5 border-b border-[var(--dashboard-accent-gold)]/10 p-6">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-[var(--dashboard-accent-gold)]">
                                <Package className="h-4 w-4" />
                                Operations Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]">
                                <Link href="/admin/scan">
                                    <Search className="h-4 w-4" />
                                    Inventory Scanner
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]">
                                <Link href="/admin/pack-slip">
                                    <List className="h-4 w-4" />
                                    Packing Slips
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]">
                                <Link href="/admin/bags">
                                    <Truck className="h-4 w-4" />
                                    Warehouse Bags
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    {viewMode === 'map' ? (
                        <Card className="rounded-[2.5rem] border-none glass-card shadow-xl overflow-hidden min-h-[600px] relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                <div className="h-20 w-20 rounded-full bg-[var(--dashboard-card)] shadow-2xl flex items-center justify-center mb-6 text-[var(--dashboard-accent-gold)] animate-bounce border border-[var(--dashboard-border)]">
                                    <MapPin className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-serif mb-2 text-[var(--dashboard-text)]">Interactive Logistics Map</h3>
                                <p className="text-[var(--dashboard-text-muted)] max-w-sm mx-auto">
                                    Visualizing {orders.length} deliveries. Add a Google Maps API key to activate real-time route optimization.
                                </p>

                                <div className="mt-12 grid sm:grid-cols-2 gap-4 w-full max-w-xl">
                                    {orders.map((order) => (
                                        <div key={order.id} className="glass-card-bright p-4 rounded-2xl border border-[var(--dashboard-border)] text-left shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-[var(--dashboard-accent-gold)] uppercase tracking-widest">{order.delivery_time || 'TBD'}</span>
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            </div>
                                            <p className="text-sm font-bold truncate text-[var(--dashboard-text)]">{order.customer_name}</p>
                                            <p className="text-[10px] text-[var(--dashboard-text-muted)] truncate mt-1">{order.delivery_address}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="rounded-[2.5rem] border-none glass-card shadow-xl overflow-hidden">
                            <CardHeader className="bg-black/20 border-b border-[var(--dashboard-border)] p-8">
                                <CardTitle className="text-xl font-serif text-[var(--dashboard-text)]">Delivery Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-[var(--dashboard-border)]">
                                    {orders.length === 0 ? (
                                        <div className="p-12 text-center text-[var(--dashboard-text-muted)]">No deliveries scheduled for this date.</div>
                                    ) : (
                                        orders.map((order) => (
                                            <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--dashboard-card-hover)] transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-14 w-14 rounded-2xl bg-black/20 flex flex-col items-center justify-center text-[var(--dashboard-text-muted)] border border-[var(--dashboard-border)]">
                                                        <span className="text-[10px] font-bold uppercase">{order.delivery_time?.split(' ')[1] || 'HR'}</span>
                                                        <span className="text-xl font-serif text-[var(--dashboard-text)]">{order.delivery_time?.split(' ')[0] || '--'}</span>
                                                    </div>
                                                    <div>
                                                        <Link href={`/admin/orders/${order.id}`} className="font-bold text-lg text-[var(--dashboard-text)] hover:text-[var(--dashboard-accent-gold)] transition-colors">
                                                            {order.customer_name}
                                                        </Link>
                                                        <div className="flex items-center gap-2 text-sm text-[var(--dashboard-text-muted)] mt-1">
                                                            <MapPin className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
                                                            {order.delivery_address}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right hidden md:block">
                                                        <p className="text-[10px] font-bold text-[var(--dashboard-text-muted)] uppercase tracking-widest">Status</p>
                                                        <p className="text-sm font-medium capitalize text-[var(--dashboard-text)]">{order.status}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="rounded-xl border-[var(--dashboard-border)] hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild>
                                                        <Link href={`/admin/orders/${order.id}`}>Manage</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
