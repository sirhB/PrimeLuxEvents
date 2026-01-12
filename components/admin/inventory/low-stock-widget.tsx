import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, AlertTriangle } from 'lucide-react'

interface LowStockWidgetProps {
    items: any[]
}

export function LowStockWidget({ items }: LowStockWidgetProps) {
    return (
        <div className="glass-card rounded-3xl border-none p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h3 className="text-xl font-serif text-[var(--dashboard-text)] font-medium">
                        Low Stock Alerts
                    </h3>
                </div>
                <Button variant="link" asChild className="text-[var(--dashboard-accent-gold)] p-0 h-auto">
                    <Link href="/admin/inventory?tab=low-stock">View All</Link>
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--dashboard-text-muted)] text-sm py-8 bg-black/5 rounded-xl">
                    <p>No low stock items found.</p>
                </div>
            ) : (
                <div className="overflow-auto -mx-2 px-2">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-white/5 hover:bg-transparent">
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2">Product</TableHead>
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2 text-right">Available</TableHead>
                                <TableHead className="text-[var(--dashboard-text-muted)] px-2 text-right">Reserved</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                    <TableCell className="px-2 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-[var(--dashboard-text)] font-medium text-sm">
                                                {item.name}
                                            </span>
                                            <span className="text-[var(--dashboard-text-muted)] text-xs font-mono">
                                                {item.sku || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-right">
                                        <span className="text-red-500 font-bold font-mono">
                                            {item.quantity_available}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-right">
                                        <span className="text-[var(--dashboard-text-muted)] font-mono">
                                            {item.quantity_reserved}
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
