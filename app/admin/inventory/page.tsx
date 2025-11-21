import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function InventoryPage() {
    const supabase = await createClient()

    // Get all rental reservations with product details
    const { data: reservations } = await supabase
        .from('rental_reservations')
        .select('*, products(name, sku)')
        .order('start_date', { ascending: true })

    // Get products with availability info
    const { data: products } = await supabase
        .from('products')
        .select('id, name, sku, quantity_available, quantity_reserved')
        .order('name')

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                <p className="text-muted-foreground mt-1">
                    Track rental reservations and product availability
                </p>
            </div>

            {/* Product Availability Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Availability</CardTitle>
                    <CardDescription>Current stock levels and reservations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Available</TableHead>
                                <TableHead>Reserved</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products?.map((product) => {
                                const available = product.quantity_available - product.quantity_reserved
                                const isLowStock = available <= 2

                                return (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {product.sku || 'N/A'}
                                        </TableCell>
                                        <TableCell>{product.quantity_available}</TableCell>
                                        <TableCell>{product.quantity_reserved}</TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                                    isLowStock
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                )}
                                            >
                                                {isLowStock ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {products?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">No products found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Upcoming Reservations */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Reservations</CardTitle>
                    <CardDescription>Scheduled rental reservations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservations?.map((reservation) => (
                                <TableRow key={reservation.id}>
                                    <TableCell className="font-medium">
                                        {reservation.products?.name || 'Unknown Product'}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(reservation.start_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(reservation.end_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{reservation.quantity}</TableCell>
                                    <TableCell>
                                        <span
                                            className={cn(
                                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                                                getStatusColor(reservation.status)
                                            )}
                                        >
                                            {reservation.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {reservations?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        <div className="flex flex-col items-center gap-2">
                                            <Calendar className="h-8 w-8 text-muted-foreground" />
                                            <p className="text-muted-foreground">
                                                No upcoming reservations.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
