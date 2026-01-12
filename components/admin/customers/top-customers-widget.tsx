import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCents } from '@/lib/format-money'
import { Crown } from 'lucide-react'

interface TopCustomersWidgetProps {
    customers: any[]
}

export function TopCustomersWidget({ customers }: TopCustomersWidgetProps) {
    return (
        <div className="glass-card rounded-3xl border-none p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-[var(--dashboard-accent-gold)]" />
                    <h3 className="text-xl font-serif text-[var(--dashboard-text)] font-medium">
                        Top Customers
                    </h3>
                </div>
            </div>

            {customers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--dashboard-text-muted)] text-sm py-8 bg-black/5 rounded-xl">
                    <p>No customer data available.</p>
                </div>
            ) : (
                <div className="overflow-auto -mx-2 px-2">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-white/5 hover:bg-transparent">
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2">Customer</TableHead>
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2 text-right">Orders</TableHead>
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2 text-right">Total Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.slice(0, 5).map((customer, idx) => (
                                <TableRow key={customer.email} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                    <TableCell className="px-2 py-3">
                                        <div className="flex items-center gap-2">
                                            {idx === 0 && <Crown className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />}
                                            <div className="flex flex-col">
                                                <span className="text-[var(--dashboard-text)] font-medium text-sm">
                                                    {customer.name}
                                                </span>
                                                <span className="text-[var(--dashboard-text-muted)] text-xs">
                                                    {customer.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-right">
                                        <span className="text-[var(--dashboard-text)] font-mono">
                                            {customer.orderCount}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-right">
                                        <span className="text-[var(--dashboard-accent-gold)] font-bold font-mono">
                                            {formatCents(customer.totalSpent)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
