'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatCents } from '@/lib/format-money'
import { FileText } from 'lucide-react'

// Mock orders data
const orders = [
    {
        id: 'ORD-001',
        customer: 'Emily Parker',
        service: 'Florals',
        amount: 650000,
        status: 'paid',
        contract: true
    },
    {
        id: 'ORD-002',
        customer: 'Daniel Foster',
        service: 'Catering',
        amount: 1803200,
        status: 'paid',
        contract: true
    },
    {
        id: 'ORD-003',
        customer: 'Ethan Brooks',
        service: 'Bar Services',
        amount: 528700,
        status: 'paid',
        contract: true
    },
    {
        id: 'ORD-004',
        customer: 'Mia Thompson',
        service: 'Dessert',
        amount: 350800,
        status: 'declined',
        contract: true
    }
]

export function EventOrders() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Associated Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Contract</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {order.customer.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                                            <div className="text-xs text-gray-500">customer@example.com</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{order.service}</TableCell>
                                <TableCell className="font-bold">{formatCents(order.amount)}</TableCell>
                                <TableCell>
                                    <StatusBadge
                                        status={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        variant={order.status === 'paid' ? 'success' : 'cancelled'}
                                    />
                                </TableCell>
                                <TableCell>
                                    {order.contract && <FileText className="h-4 w-4 text-gray-400" />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
