import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCents } from '@/lib/format-money'
import { ArrowRight, Play, Pause } from 'lucide-react'

interface RecentActivityListProps {
    orders: any[]
}

export function RecentActivityList({ orders }: RecentActivityListProps) {
    return (
        <Card className="bg-[var(--dashboard-card)] border-none text-[var(--dashboard-text)] shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-[var(--dashboard-text-muted)]">
                        <span className="cursor-pointer hover:text-white">Filter</span>
                    </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-[var(--dashboard-text-muted)] hover:text-white">
                    <Link href="/admin/orders" className="flex items-center gap-1">
                        See all <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-5 text-sm text-[var(--dashboard-text-muted)] mb-4 px-2">
                        <div className="col-span-2">Name</div>
                        <div>Status</div>
                        <div>Date</div>
                        <div className="text-right">Amount</div>
                    </div>
                    {orders.map((order) => (
                        <div key={order.id} className="grid grid-cols-5 items-center px-2 py-2 hover:bg-[var(--dashboard-card-hover)] rounded-lg transition-colors">
                            <div className="col-span-2 font-medium truncate pr-4">
                                {order.customer_name}
                            </div>
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--dashboard-accent-purple)]/20 text-[var(--dashboard-accent-purple)]">
                                    In progress
                                </span>
                            </div>
                            <div className="text-sm text-[var(--dashboard-text-muted)]">
                                {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-right font-medium">
                                {formatCents(order.total_amount)}
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <p className="text-center text-[var(--dashboard-text-muted)] py-8">No recent orders</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
