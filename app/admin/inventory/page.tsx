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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Operations
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Inventory
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Track rental reservations and product availability.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="glass-card border-none p-1 bg-black/20 mb-6 w-fit h-auto">
                    <TabsTrigger value="all" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">All Inventory</TabsTrigger>
                    <TabsTrigger value="low-stock" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">Low Stock</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6 animate-fade-in">
                    <div className="flex items-center justify-between gap-4">
                        <SearchInput placeholder="Search inventory..." />
                    </div>

                    <Card className="border-none glass-card overflow-hidden">
                        <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                            <CardTitle className="font-serif text-2xl">Product Availability</CardTitle>
                            <CardDescription className="text-[var(--dashboard-text-muted)]">Current stock levels and rental reservations</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-black/20">
                                    <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4 pl-6">Product</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">SKU</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] text-right">Available</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] text-right">Reserved</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] text-center pr-6">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products?.map((product) => {
                                        const available = product.quantity_available - product.quantity_reserved
                                        const isLowStock = available <= 2

                                        return (
                                            <TableRow key={product.id} className="hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors">
                                                <TableCell className="font-serif text-lg py-4 pl-6">{product.name}</TableCell>
                                                <TableCell className="font-mono text-xs text-[var(--dashboard-text-muted)]">
                                                    {product.sku || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-bold text-[var(--dashboard-text)]">{product.quantity_available}</TableCell>
                                                <TableCell className="text-right font-mono text-[var(--dashboard-text-muted)]">{product.quantity_reserved}</TableCell>
                                                <TableCell className="text-center pr-6">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border',
                                                            isLowStock
                                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                                : 'bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border-[var(--dashboard-accent-gold)]/20 shadow-[0_0_10px_rgba(212,175,55,0.05)]'
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
                                            <TableCell colSpan={5} className="text-center h-40">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <Package className="h-10 w-10 text-[var(--dashboard-text-muted)]" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">No products found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {count !== null && count > 0 && (
                        <div className="flex justify-center mt-8">
                            <PaginationControls
                                hasNextPage={end < count}
                                hasPrevPage={start > 0}
                                totalCount={count}
                                currentPage={currentPage}
                                pageSize={pageSize}
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="low-stock" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-60 glass-card rounded-3xl border-none">
                        <p className="text-[var(--dashboard-text-muted)] font-light">Low stock view coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
