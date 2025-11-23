import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCents } from '@/lib/format-money'
import { ArrowRight } from 'lucide-react'

interface RecentActivityListProps {
    orders: any[]
}

export function RecentActivityList({ orders }: RecentActivityListProps) {
    return (
        <Card className="bg-[var(--dashboard-card)] border border-[var(--dashboard-text)]/5 text-[var(--dashboard-text)] shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-xl font-semibold">Recent Orders</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-[var(--dashboard-text-muted)]">
                        <span className="cursor-pointer hover:text-[var(--dashboard-text)] transition-colors">Filter</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] transition-colors">
                    <Link href="/admin/orders" className="flex items-center gap-1">
                        See all <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 text-xs font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wide pb-3 px-4 border-b border-[var(--dashboard-text)]/5">
                        <div>Name</div>
                        <div>Status</div>
                        <div>Date</div>
                        <div className="text-right">Amount</div>
                    </div>
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center px-4 py-4 hover:bg-[var(--dashboard-card-hover)] rounded-xl transition-all duration-200 group cursor-pointer border border-transparent hover:border-[var(--dashboard-text)]/5"
                        >
                            <div className="font-medium truncate text-[var(--dashboard-text)] group-hover:text-[var(--dashboard-accent-gold)] transition-colors">
                                {order.customer_name}
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                    In progress
                                </span>
                            </div>
                            <div className="text-sm text-[var(--dashboard-text-muted)]">
                                {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-right font-semibold text-[var(--dashboard-text)]">
                                {formatCents(order.total_amount)}
                            </div>
                        </Link>
                    ))}
                    {orders.length === 0 && (
                        <p className="text-center text-[var(--dashboard-text-muted)] py-12 text-sm">No recent orders</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
