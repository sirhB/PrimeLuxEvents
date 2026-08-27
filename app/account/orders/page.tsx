import { createClient } from '@/lib/supabase/server'
import { formatCentsWithCommas } from '@/lib/format-money'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: { status?: string }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const statusFilter = searchParams.status || 'all'

    let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    const { data: orders } = await query

    const statuses = [
        { label: 'All Orders', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">My Orders</h1>
                <p className="text-muted-foreground">
                    Track your current orders and view your event history.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
                {statuses.map((status) => (
                    <Link
                        key={status.value}
                        href={`/account/orders${status.value === 'all' ? '' : `?status=${status.value}`}`}
                        className={cn(
                            "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                            statusFilter === status.value
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        {status.label}
                    </Link>
                ))}
            </div>

            {/* Orders List */}
            <div className="grid gap-4">
                {orders && orders.length > 0 ? (
                    orders.map((order) => (
                        <Link key={order.id} href={`/account/orders/${order.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Package className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <span>Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                                                {order.delivery_date && (
                                                    <span>Delivery: {new Date(order.delivery_date).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:text-right gap-4">
                                        <div className="space-y-1">
                                            <p className="text-lg font-bold">{formatCentsWithCommas(order.total_amount)}</p>
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                                order.status === 'confirmed' ? "bg-green-100 text-green-800" :
                                                    order.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                                                        order.status === 'completed' ? "bg-blue-100 text-blue-800" :
                                                            "bg-gray-100 text-gray-800"
                                            )}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="sm:hidden">
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">No orders found matching your filter.</p>
                            <Link href="/catalog" className="text-primary hover:underline mt-2 inline-block">
                                Browse our catalog
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
