import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCents } from '@/lib/format-money'
import { ArrowRight, Search, Filter } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

interface RecentActivityListProps {
    orders: any[]
}

export function RecentActivityList({ orders }: RecentActivityListProps) {
    return (
        <Card className="bg-[var(--dashboard-card)] border-none text-[var(--dashboard-text)] shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-xl font-serif font-medium">Last transaction</CardTitle>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--dashboard-text-muted)]" />
                        <Input
                            placeholder="Search"
                            className="pl-9 h-9 w-[200px] bg-[var(--dashboard-background)] border-none text-sm"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-none bg-[var(--dashboard-background)]">
                        <Filter className="h-4 w-4 text-[var(--dashboard-text-muted)]" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="grid grid-cols-[auto_1fr_2fr_1fr_1fr_1fr] gap-4 text-xs font-medium text-[var(--dashboard-text-muted)] pb-3 px-4 border-b border-[var(--dashboard-border)]">
                        <Checkbox />
                        <div>Order ID</div>
                        <div>Item</div>
                        <div>Date</div>
                        <div>Price</div>
                        <div>Status</div>
                    </div>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="grid grid-cols-[auto_1fr_2fr_1fr_1fr_1fr] gap-4 items-center px-4 py-3 hover:bg-[var(--dashboard-card-hover)] transition-colors group"
                        >
                            <Checkbox />
                            <div className="font-medium text-sm">
                                #{order.id.slice(0, 6).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-gray-100 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">Product Name</span>
                            </div>
                            <div className="text-sm text-[var(--dashboard-text-muted)]">
                                {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="font-semibold text-sm">
                                {formatCents(order.total_amount)}
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--dashboard-accent-green)] bg-[var(--dashboard-accent-green)]/10 px-2 py-1 rounded-full">
                                    Completed
                                </span>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <p className="text-center text-[var(--dashboard-text-muted)] py-12 text-sm">No recent transactions</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
