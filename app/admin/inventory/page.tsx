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
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>
}) {
    const { page = '1', search } = await searchParams
    const supabase = await createClient()

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    // Get products with availability info
    let query = supabase
        .from('products')
        .select('id, name, sku, quantity_available, quantity_reserved', { count: 'exact' })
        .order('name')

    if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    const { data: products, count } = await query.range(start, end)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Track rental reservations and product availability
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput placeholder="Search inventory..." />
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

            {count !== null && count > 0 && (
                <PaginationControls
                    hasNextPage={end < count}
                    hasPrevPage={start > 0}
                    totalCount={count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                />
            )}
        </div>
    )
}
