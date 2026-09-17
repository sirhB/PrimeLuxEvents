import { createClient } from '@/lib/supabase/server'
import { formatCentsWithCommas } from '@/lib/format-money'
import { Calendar, Package, Clock, ArrowRight, CheckCircle2, PenLine, Truck, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { OrderStatusChip } from '@/components/account/order-status-chip'
import { getPartnerProfileForUser } from '@/lib/auth/partners'

export default async function AccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const partner = await getPartnerProfileForUser(user.id)

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

    let daysUntil: number | null = null
    if (upcomingOrder?.delivery_date) {
        const diffTime = new Date(upcomingOrder.delivery_date).getTime() - now.getTime()
        daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const balanceDue =
        upcomingOrder && typeof upcomingOrder.total_amount === 'number'
            ? Math.max(0, (upcomingOrder.total_amount || 0) - (upcomingOrder.amount_paid || 0))
            : 0

    const timeline = upcomingOrder
        ? [
            {
                label: 'Order placed',
                done: true,
                icon: Package,
                detail: upcomingOrder.created_at
                    ? new Date(upcomingOrder.created_at).toLocaleDateString()
                    : undefined,
            },
            {
                label: 'Agreement signed',
                done: Boolean(upcomingOrder.signature_url),
                icon: PenLine,
                detail: upcomingOrder.signed_at
                    ? new Date(upcomingOrder.signed_at).toLocaleDateString()
                    : 'Awaiting signature',
            },
            {
                label: 'Delivery',
                done: ['delivered', 'completed', 'returned'].includes(upcomingOrder.status),
                icon: Truck,
                detail: upcomingOrder.delivery_date
                    ? new Date(upcomingOrder.delivery_date).toLocaleDateString()
                    : undefined,
            },
            {
                label: 'Pickup',
                done: ['completed', 'returned'].includes(upcomingOrder.status),
                icon: CheckCircle2,
                detail: upcomingOrder.pickup_date
                    ? new Date(upcomingOrder.pickup_date).toLocaleDateString()
                    : upcomingOrder.same_day_pickup
                        ? 'Same-day pickup'
                        : 'Scheduled after event',
            },
        ]
        : []

    return (
        <div className="space-y-10">
            <header className="space-y-2">
                <p className="lux-label">Customer portal</p>
                <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-foreground">
                    Your rentals
                </h1>
                <p className="text-muted-foreground font-light max-w-xl">
                    Track your next delivery, review documents, and manage past orders — all in one place.
                </p>
            </header>

            {/* Next order hero — primary customer job */}
            {upcomingOrder ? (
                <section className="surface-panel rounded-md p-6 md:p-8 space-y-6 border-gold/25">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Next rental</p>
                            <h2 className="font-serif text-2xl md:text-3xl font-light">
                                Delivery{' '}
                                {upcomingOrder.delivery_date
                                    ? new Date(upcomingOrder.delivery_date).toLocaleDateString(undefined, {
                                          weekday: 'short',
                                          month: 'short',
                                          day: 'numeric',
                                      })
                                    : 'date TBD'}
                            </h2>
                            <p className="text-sm text-muted-foreground font-light">
                                Order #{upcomingOrder.id.slice(0, 8).toUpperCase()}
                                {daysUntil !== null ? ` · ${daysUntil} day${daysUntil === 1 ? '' : 's'} away` : ''}
                            </p>
                            <div className="pt-1">
                                <OrderStatusChip status={upcomingOrder.status} />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                            <Link href={`/account/orders/${upcomingOrder.id}`} className="lux-cta !min-h-11 !px-5 text-[10px]">
                                View order
                            </Link>
                            <Link href="/account/messages" className="lux-cta-ghost !min-h-11 !px-5 text-[10px]">
                                <MessageSquare className="h-3.5 w-3.5" /> Help with this order
                            </Link>
                        </div>
                    </div>

                    {balanceDue > 0 && (
                        <p className="text-sm font-light text-amber-100/90 bg-amber-500/10 border border-amber-500/20 rounded-md px-4 py-3">
                            Remaining balance {formatCentsWithCommas(balanceDue)}. Pay before delivery or contact us if you need a link.
                        </p>
                    )}

                    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {timeline.map((step) => {
                            const Icon = step.icon
                            return (
                                <li
                                    key={step.label}
                                    className="rounded-md border border-border bg-[var(--surface)] p-4"
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <span
                                            className={`rounded-[var(--radius-cta)] p-2 ${
                                                step.done
                                                    ? 'bg-gold/15 text-gold'
                                                    : 'bg-[var(--surface-muted)] text-muted-foreground'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="text-sm font-medium text-foreground">{step.label}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-light">{step.detail}</p>
                                </li>
                            )
                        })}
                    </ol>
                </section>
            ) : (
                <section className="surface-panel rounded-md px-8 py-12 text-center space-y-5">
                    <Package className="h-10 w-10 text-gold mx-auto opacity-70" />
                    <div className="space-y-2">
                        <h2 className="font-serif text-2xl font-light">No upcoming rentals</h2>
                        <p className="text-muted-foreground font-light max-w-md mx-auto">
                            Browse the collection to build your next event rental — checkout takes a few minutes.
                        </p>
                    </div>
                    <Link href="/catalog" className="lux-cta inline-flex">
                        Browse the collection <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="surface-panel rounded-md p-5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Orders</p>
                        <Package className="h-4 w-4 text-gold" />
                    </div>
                    <p className="text-2xl font-light font-serif">{totalOrders}</p>
                </div>
                <div className="surface-panel rounded-md p-5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Next delivery</p>
                        <Calendar className="h-4 w-4 text-gold" />
                    </div>
                    <p className="text-lg font-light font-serif">
                        {upcomingOrder?.delivery_date
                            ? new Date(upcomingOrder.delivery_date).toLocaleDateString()
                            : '—'}
                    </p>
                </div>
                <div className="surface-panel rounded-md p-5">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Countdown</p>
                        <Clock className="h-4 w-4 text-gold" />
                    </div>
                    <p className="text-2xl font-light font-serif text-gold">
                        {daysUntil !== null ? `${daysUntil}d` : '—'}
                    </p>
                </div>
            </div>

            {!partner && (
                <div className="flex flex-col gap-3 rounded-md border border-border surface-panel px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground">Event planner or venue?</p>
                        <p className="text-xs text-muted-foreground font-light">
                            Preferred partners get trade rates and client share carts.
                        </p>
                    </div>
                    <Link href="/account/partner/apply" className="lux-cta-ghost !min-h-10 !px-4 text-[10px] shrink-0">
                        Learn more
                    </Link>
                </div>
            )}

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-light">Recent orders</h2>
                    <Link
                        href="/account/orders"
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-gold flex items-center gap-1"
                    >
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="grid gap-3">
                    {recentOrders.length > 0 ? (
                        recentOrders.map((order: any) => (
                            <Link key={order.id} href={`/account/orders/${order.id}`}>
                                <div className="surface-panel rounded-md px-5 py-4 flex items-center justify-between transition-colors hover:border-gold/30 border border-transparent">
                                    <div className="space-y-1">
                                        <p className="font-medium text-foreground">
                                            Order #{order.id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-light">
                                            Placed {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="font-medium text-gold">{formatCentsWithCommas(order.total_amount)}</p>
                                        <OrderStatusChip status={order.status} />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="surface-panel rounded-md border-dashed px-6 py-10 text-center space-y-4">
                            <p className="text-muted-foreground font-light">No orders yet.</p>
                            <Link href="/catalog" className="lux-cta inline-flex">
                                Browse the collection
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
