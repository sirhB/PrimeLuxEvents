import { createClient } from '@/lib/supabase/server'
import { formatCentsWithCommas } from '@/lib/format-money'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Package, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrderStatusChip } from '@/components/account/order-status-chip'

export default async function AccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const recentOrders = orders?.slice(0, 3) || []
    const totalOrders = orders?.length || 0

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
            <div className="flex flex-col gap-2">
                <h2 className="font-serif text-2xl font-light tracking-tight text-[var(--ink,#121110)]">
                    Your dashboard
                </h2>
                <p className="text-muted-foreground">
                    Track deliveries, review orders, and update your profile.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="spotlight-frame border-border/60 bg-white/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Orders placed to date</p>
                    </CardContent>
                </Card>

                <Card className="spotlight-frame border-border/60 bg-white/80">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next event</CardTitle>
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

                <Card className="spotlight-frame border-[var(--champagne,#B8956B)]/25 bg-[color-mix(in_srgb,var(--champagne)_8%,white)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[var(--champagne,#B8956B)]">Countdown</CardTitle>
                        <Clock className="h-4 w-4 text-[var(--champagne,#B8956B)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[var(--ink,#121110)]">
                            {daysUntil !== null ? `${daysUntil} days` : '---'}
                        </div>
                        <p className="text-xs text-muted-foreground">Until your next delivery</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-light">Recent orders</h2>
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
                                <Card className="spotlight-frame border-border/60 bg-white/80 transition-colors hover:border-[var(--champagne,#B8956B)]/30">
                                    <CardContent className="flex items-center justify-between py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="font-bold">{formatCentsWithCommas(order.total_amount)}</p>
                                            <OrderStatusChip status={order.status} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <Card className="spotlight-frame border-dashed border-border/80 bg-white/60">
                            <CardContent className="space-y-4 py-10 text-center">
                                <p className="text-muted-foreground">
                                    No orders yet. Browse the collection to start planning your event.
                                </p>
                                <Button asChild className="rounded-full bg-[var(--champagne,#B8956B)] text-black hover:bg-[var(--ink,#121110)] hover:text-white">
                                    <Link href="/catalog">Browse the collection</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
