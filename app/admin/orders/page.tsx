import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'

export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage customer orders
                </p>
            </div>
            <div className="rounded-md border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{order.customer_name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {order.customer_email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>${order.total_amount}</TableCell>
                                <TableCell>
                                    <span className="capitalize">{order.status}</span>
                                </TableCell>
                                <TableCell>
                                    {new Date(order.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/admin/orders/${order.id}`}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View</span>
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
