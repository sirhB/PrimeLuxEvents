import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, MapPin, Package, ArrowRight, TrendingUp, DollarSign } from 'lucide-react'
import { formatCents } from '@/lib/format-money'
import { cn } from '@/lib/utils'

interface Order {
    id: string
    customer_name: string
    total_amount: number
    status: string
    created_at: string
    delivery_time: string | null
}

export async function UpcomingOrdersCard() {
    const supabase = await createClient()

    // Calculate date range (next 10 days)
    const today = new Date()
    const tenDaysFromNow = new Date()
    tenDaysFromNow.setDate(today.getDate() + 10)

    const todayStr = today.toISOString().split('T')[0]
    const tenDaysStr = tenDaysFromNow.toISOString().split('T')[0]

    // Get orders with delivery times within the next 10 days
    const { data: orders } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at, delivery_time')
        .not('delivery_time', 'is', null)
        .gte('delivery_time', todayStr)
        .lte('delivery_time', tenDaysStr)
        .order('delivery_time', { ascending: true })
        .limit(5)

    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    return (
        <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl bg-white h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Package className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-serif font-light tracking-tight">Upcoming Orders</CardTitle>
                        <p className="text-xs text-muted-foreground font-light">Next 10 days</p>
                    </div>
                </div>
                <Link href="/admin/orders">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full font-medium">
                        See All
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded-md bg-emerald-100">
                                <TrendingUp className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Orders</span>
                        </div>
                        <p className="text-2xl font-serif font-bold text-emerald-900">{totalOrders}</p>
                    </div>
                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded-md bg-blue-100">
                                <DollarSign className="h-3 w-3 text-blue-600" />
                            </div>
                            <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Revenue</span>
                        </div>
                        <p className="text-2xl font-serif font-bold text-blue-900">{formatCents(totalRevenue)}</p>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                    {!orders || orders.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Package className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-light">No upcoming orders found.</p>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const deliveryDate = order.delivery_time ? new Date(order.delivery_time) : null
                            const daysUntil = deliveryDate
                                ? Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                : null

                            return (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="block group"
                                >
                                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                                                {order.customer_name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                {deliveryDate && (
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                        <Calendar className="h-3 w-3" />
                                                        {deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                )}
                                                {daysUntil !== null && (
                                                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
                                                        <MapPin className="h-3 w-3" />
                                                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-sm font-bold text-gray-900">
                                                {formatCents(order.total_amount)}
                                            </p>
                                            <span className={cn(
                                                "inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                                order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-700'
                                            )}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="h-4 w-4 text-emerald-600" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
