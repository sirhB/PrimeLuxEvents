import { createClient } from '@/lib/supabase/server'
import { formatCentsWithCommas } from '@/lib/format-money'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Package, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function AccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch user profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch orders for summary and recent list
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const recentOrders = orders?.slice(0, 3) || []
    const totalOrders = orders?.length || 0

    // Find next upcoming order for countdown
    const now = new Date()
    const upcomingOrder = orders
        ?.filter((o: any) => o.delivery_date && new Date(o.delivery_date) >= now && o.status !== 'cancelled')
        .sort((a: any, b: any) => new Date(a.delivery_date!).getTime() - new Date(b.delivery_date!).getTime())[0]

    let daysUntil = null
    if (upcomingOrder?.delivery_date) {
        const diffTime = new Date(upcomingOrder.delivery_date).getTime() - now.getTime()
        daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">
                    Welcome back, {profile?.full_name || user.email?.split('@')[0]}
                </h1>
                <p className="text-muted-foreground">
                    Manage your events and view your order history from your dashboard.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats Summary */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Orders placed to date</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Event</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {upcomingOrder?.delivery_date
                                ? new Date(upcomingOrder.delivery_date).toLocaleDateString()
                                : 'No upcoming events'}
                        </div>
                        <p className="text-xs text-muted-foreground">Your next scheduled delivery</p>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Countdown</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            {daysUntil !== null ? `${daysUntil} Days` : '---'}
                        </div>
                        <p className="text-xs text-primary/70">Remaining until your next event</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold">Recent Orders</h2>
                    <Button variant="ghost" asChild>
                        <Link href="/account/orders" className="flex items-center gap-1">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4">
                    {recentOrders.length > 0 ? (
                        recentOrders.map((order: any) => (
                            <Link key={order.id} href={`/account/orders/${order.id}`}>
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="flex items-center justify-between py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="font-bold">{formatCentsWithCommas(order.total_amount)}</p>
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                                order.status === 'confirmed' ? "bg-green-100 text-green-800" :
                                                    order.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-gray-100 text-gray-800"
                                            )}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No orders found. Ready to start planning your next event?
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
