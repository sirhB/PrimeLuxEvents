import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { ProductFilters } from '@/components/admin/product-filters'
import { ProductsTable } from '@/components/admin/products-table'
import { ProductStatsCards } from '@/components/admin/products/product-stats-cards'

import { requirePermission } from '@/lib/auth/authorization'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category_id?: string; page?: string; search?: string; sort?: string; stock_status?: string }>
}) {
    await requirePermission('products.view')
    const { category_id, page = '1', search, sort = 'newest', stock_status } = await searchParams
    const supabase = await createClient()

    // Fetch categories for filter
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

    // Fetch all products for metrics
    const { data: allProducts } = await supabase
        .from('products')
        .select('price, cost, quantity_available')

    // Calculate metrics
    const totalProducts = allProducts?.length || 0
    const lowStockCount = allProducts?.filter(p => (p.quantity_available || 0) <= 5).length || 0
    const totalValue = allProducts?.reduce((sum, p) => sum + (p.cost || 0) * (p.quantity_available || 0), 0) || 0
    const categoriesCount = categories?.length || 0

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

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
        query = query.gt('quantity_available', 5)
    } else if (stock_status === 'low_stock') {
        query = query.gt('quantity_available', 0).lte('quantity_available', 5)
    } else if (stock_status === 'out_of_stock') {
        query = query.eq('quantity_available', 0)
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
                    <Button asChild variant="outline" className="rounded-full border-[var(--dashboard-accent-gold)] text-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/10 font-medium px-6">
                        <Link href="/admin/products/verify">
                            Verification Mode
                        </Link>
                    </Button>
                    <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                        <Link href="/admin/products/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Dashboard Statistics */}
            <ProductStatsCards
                totalProducts={totalProducts}
                lowStockCount={lowStockCount}
                totalValue={totalValue}
                categoriesCount={categoriesCount}
            />

            <Tabs defaultValue="products" className="w-full">
                <TabsList className="glass-card border-none p-1 bg-black/20 mb-8 w-fit h-auto">
                    <TabsTrigger value="products" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-8 h-10 rounded-xl">
                        <Link href="/admin/products">Products</Link>
                    </TabsTrigger>
                    <TabsTrigger value="categories" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-8 h-10 rounded-xl">
                        <Link href="/admin/categories">Categories</Link>
                    </TabsTrigger>
                    <TabsTrigger value="inventory" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-8 h-10 rounded-xl">
                        <Link href="/admin/inventory">Inventory Tracking</Link>
                    </TabsTrigger>
                    <TabsTrigger value="packages" asChild className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-8 h-10 rounded-xl">
                        <Link href="/admin/packages">Packages</Link>
                    </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Quick Filters:</span>
                    <Tabs defaultValue={stock_status === 'low_stock' || stock_status === 'out_of_stock' ? 'inventory' : 'all'} className="w-auto">
                        <TabsList className="bg-white/5 border-none p-0.5 h-8">
                            <TabsTrigger value="all" asChild className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-[10px] uppercase font-bold tracking-widest px-4 h-7 rounded-lg">
                                <Link href="/admin/products">All Products</Link>
                            </TabsTrigger>
                            <TabsTrigger value="inventory" asChild className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-[10px] uppercase font-bold tracking-widest px-4 h-7 rounded-lg">
                                <Link href="/admin/products?stock_status=low_stock">Needs Attention ({lowStockCount})</Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="space-y-6 mt-6 animate-fade-in">
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
                </div>
            </Tabs>

        </div>
    )
}

