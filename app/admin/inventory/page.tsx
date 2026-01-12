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
import { InventoryStatsCards } from '@/components/admin/inventory/inventory-stats-cards'
import { LowStockWidget } from '@/components/admin/inventory/low-stock-widget'

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; tab?: string }>
}) {
    const { page = '1', search, tab = 'all' } = await searchParams
    const supabase = await createClient()

    // 1. Fetch Metrics (Parallel)
    // Note: We need to calc total units from all products. 
    // Since we can't do sum() easily without a view or rpc in simple select, we might fetch all id, qty_avail, qty_reserved for metrics if count is low, 
    // or just use count for now.
    // Let's rely on 'count' for Total Products.
    // For Total Units and Reserved, we might need a separate query or assume approximate. 
    // Let's try to get a sum via a small query if possible, or just exact counts for "Low Stock".

    // We will do a full scan for metrics? No, that's heavy.
    // Let's just count rows for "Total Products".
    // For "Low Stock", count rows where available <= 2.
    // For "Reserved", we can't easily sum without a function or fetching all. 
    // Let's write a simple query to fetch *only* quantity columns for ALL products to aggregate in JS (assuming < 10k products, this is fine).

    const metricsPromise = supabase
        .from('products')
        .select('quantity_available, quantity_reserved')

    // 2. Fetch Low Stock Items (Limit 5 for widget)
    const lowStockWidgetPromise = supabase
        .from('products')
        .select('id, name, sku, quantity_available, quantity_reserved')
        .lte('quantity_available', 2)
        .order('quantity_available', { ascending: true })
        .limit(5)

    // 3. Fetch Main Table Data
    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('products')
        .select('id, name, sku, quantity_available, quantity_reserved', { count: 'exact' })
        .order('name')

    if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    // If we are on low-stock tab, filter query
    if (tab === 'low-stock') {
        query = query.lte('quantity_available', 2)
    }

    const tablePromise = query.range(start, end)

    const [
        { data: allProductsMetrics },
        { data: lowStockWidgetItems },
        { data: products, count }
    ] = await Promise.all([
        metricsPromise,
        lowStockWidgetPromise,
        tablePromise
    ])

    // Calc aggregated metrics
    const totalProducts = allProductsMetrics?.length || 0
    const totalUnits = allProductsMetrics?.reduce((acc, p) => acc + p.quantity_available + p.quantity_reserved, 0) || 0
    // Actually quantity_available is usually "on hand - reserved" or "total physical on hand"? 
    // Usually Available = Total - Reserved. or Total = Available + Reserved.
    // Let's assume Total Physical = Available + Reserved.
    const totalReserved = allProductsMetrics?.reduce((acc, p) => acc + p.quantity_reserved, 0) || 0
    const lowStockCount = allProductsMetrics?.filter(p => p.quantity_available <= 2).length || 0

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

            {/* Dashboard Statistics */}
            <InventoryStatsCards
                totalProducts={totalProducts}
                totalUnits={totalUnits}
                lowStockCount={lowStockCount}
                totalReserved={totalReserved}
            />

            {/* Widgets Row - simplified for now, just header or maybe a chart later. 
                For now we just have the Low Stock Widget. 
                We can put it side by side with something else or full width?
                Let's make it 1/3 width to the right, and maybe something else on left? 
                Or just top level cards and then tabs.
                Actually, the plan said "Middle Row: Low Stock Alert Widget".
            */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Maybe a placeholder for 'Top Reserved' or 'Most Popular'? For now just take up space or be full width?
                    Let's make low stock widget prominent.
                 */}
                <div className="lg:col-span-3">
                    {/* For now, just render grid of widgets if we had more. 
                         Since we only have one widget defined in plan, let's put it above tabs if it's important.
                         But wait, if we have tabs, maybe the widget is redundant?
                         No, dashboard view is nice.
                     */}
                </div>
            </div>

            {/* Let's put the Low Stock Widget in a grid with the stats? Or just below.
                Let's put it in a 2-column layout with the table? No table is huge.
                Let's just have it above the table for now, or maybe only show it if not searching.
             */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LowStockWidget items={lowStockWidgetItems || []} />
                {/* Placeholder for future widget */}
                <Card className="glass-card border-none flex flex-col items-center justify-center p-6 text-[var(--dashboard-text-muted)]">
                    <p>Most Popular Items (Coming Soon)</p>
                </Card>
            </div>


            <Tabs defaultValue={tab || "all"} className="w-full">
                <TabsList className="glass-card border-none p-1 bg-black/20 mb-6 w-fit h-auto">
                    <TabsTrigger value="all" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">
                        <a href="/admin/inventory?tab=all">All Inventory</a>
                    </TabsTrigger>
                    <TabsTrigger value="low-stock" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">
                        <a href="/admin/inventory?tab=low-stock">Low Stock ({lowStockCount})</a>
                    </TabsTrigger>
                </TabsList>

                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between gap-4">
                        <SearchInput placeholder="Search inventory..." />
                    </div>

                    <Card className="border-none glass-card overflow-hidden">
                        <CardHeader className="border-b border-[var(--dashboard-border)] pb-6">
                            <CardTitle className="font-serif text-2xl">
                                {tab === 'low-stock' ? 'Low Stock Items' : 'Product Availability'}
                            </CardTitle>
                            <CardDescription className="text-[var(--dashboard-text-muted)]">
                                {tab === 'low-stock'
                                    ? 'Items with 2 or fewer units available'
                                    : 'Current stock levels and rental reservations'}
                            </CardDescription>
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
                                        const available = product.quantity_available
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
                </div>
            </Tabs>
        </div>
    )
}

