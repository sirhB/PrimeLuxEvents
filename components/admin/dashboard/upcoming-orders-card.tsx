import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, MapPin, Package } from 'lucide-react'
import { formatCents } from '@/lib/format-money'

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
        <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-bold">Upcoming Orders</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Next 10 days</p>
                </div>
                <Button variant="link" className="text-[#6366f1] font-semibold" asChild>
                    <Link href="/admin/orders">See All</Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">Total Orders</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{totalOrders}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900">{formatCents(totalRevenue)}</p>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-2">
                    {!orders || orders.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No upcoming orders</p>
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
                                    className="block"
                                >
                                    <div className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                {order.customer_name}
                                            </p>
                                            {deliveryDate && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {deliveryDate.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            {daysUntil !== null && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right ml-3">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatCents(order.total_amount)}
                                            </p>
                                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {order.status}
                                            </span>
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
