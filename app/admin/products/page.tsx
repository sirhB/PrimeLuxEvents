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
import { Eye, MoreVertical, Pencil, Trash2, Plus, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { ProductFilters } from '@/components/admin/product-filters'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { ProductsTable } from '@/components/admin/products-table'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category_id?: string; page?: string; search?: string; sort?: string; stock_status?: string }>
}) {
    const { category_id, page = '1', search, sort = 'newest', stock_status } = await searchParams
    const supabase = await createClient()

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    // Fetch categories for filter
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

    let query = supabase
        .from('products')
        .select('*, categories(name)', { count: 'exact' })

    // Apply filters
    if (category_id) {
        query = query.eq('category_id', category_id)
    }

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    // Apply stock filtering
    if (stock_status === 'in_stock') {
        query = query.gt('stock', 0)
    } else if (stock_status === 'low_stock') {
        query = query.gt('stock', 0).lte('stock', 5)
    } else if (stock_status === 'out_of_stock') {
        query = query.eq('stock', 0)
    }

    // Apply sorting
    switch (sort) {
        case 'oldest':
            query = query.order('created_at', { ascending: true })
            break
        case 'price_asc':
            query = query.order('price', { ascending: true })
            break
        case 'price_desc':
            query = query.order('price', { ascending: false })
            break
        case 'name_asc':
            query = query.order('name', { ascending: true })
            break
        case 'name_desc':
            query = query.order('name', { ascending: false })
            break
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false })
            break
    }

    const { data: products, count } = await query.range(start, end)

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Inventory
                        </span>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                            Products
                        </h1>
                        <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md mt-2">
                            Manage your product catalog, pricing, and inventory levels.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                        <Link href="/admin/products/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="glass-card border-none p-1 bg-black/20 mb-6 w-fit h-auto">
                    <TabsTrigger value="all" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">All Products</TabsTrigger>
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6">Inventory</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6 animate-fade-in">
                    <div className="flex flex-col xxl:flex-row gap-6 items-start xxl:items-center justify-between glass-card p-6 rounded-3xl border-none">
                        <div className="w-full max-w-md">
                            <SearchInput placeholder="Search products..." />
                        </div>
                        <ProductFilters categories={categories || []} />
                    </div>

                    <ProductsTable products={products || []} />

                    {count !== null && count > 0 && (
                        <div className="mt-8 flex justify-center">
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

                <TabsContent value="inventory" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-60 glass-card rounded-3xl border-none">
                        <div className="text-center">
                            <Package className="h-10 w-10 text-[var(--dashboard-text-muted)] opacity-30 mx-auto mb-4" />
                            <p className="text-[var(--dashboard-text-muted)] font-light">Inventory management view coming soon</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
