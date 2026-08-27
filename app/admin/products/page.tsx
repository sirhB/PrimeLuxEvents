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
import { adaptProducts, type LiveProduct } from '@/lib/catalog/adapters'

import { requirePermission } from '@/lib/auth/authorization'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category_id?: string; page?: string; search?: string; sort?: string; stock_status?: string }>
}) {
    await requirePermission('products.view')
    const { category_id, page = '1', search, sort = 'newest', stock_status } = await searchParams
    const supabase = await createClient()

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('products')
        .select('id, name, slug, description, category_id, sku, price_cents, cost_cents, image_url, gallery_images, specifications, is_active, created_at', { count: 'exact' })

    if (category_id) query = query.eq('category_id', category_id)
    if (search) query = query.ilike('name', `%${search}%`)

    switch (sort) {
        case 'oldest': query = query.order('created_at', { ascending: true }); break
        case 'price_asc': query = query.order('price_cents', { ascending: true }); break
        case 'price_desc': query = query.order('price_cents', { ascending: false }); break
        case 'name_asc': query = query.order('name', { ascending: true }); break
        case 'name_desc': query = query.order('name', { ascending: false }); break
        case 'newest':
        default: query = query.order('created_at', { ascending: false }); break
    }

    const [categoriesRes, statsRes, productsRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('name'),
        supabase.from('products').select('cost_cents, specifications'),
        query.range(start, end),
    ])

    const categories = categoriesRes.data || []
    const categoryById = new Map(categories.map((c: any) => [c.id, c]))

    const adapted = adaptProducts(
        ((productsRes.data || []) as LiveProduct[]).map((p) => ({
            ...p,
            categories: p.category_id
                ? { name: categoryById.get(p.category_id)?.name || 'Uncategorized' }
                : null,
        })),
    )

    // Optional stock_status filter client-side (qty lives in specifications on plux)
    const filtered = stock_status
        ? adapted.filter((p) => {
            const qty = p.quantity_available
            if (stock_status === 'in_stock') return qty > 5
            if (stock_status === 'low_stock') return qty > 0 && qty <= 5
            if (stock_status === 'out_of_stock') return qty <= 0
            return true
        })
        : adapted

    const tableProducts = filtered.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.quantity_available,
        categories: p.categories ? { name: p.categories.name } : null,
        is_verified: true,
        image_url: p.image_url,
        sku: p.sku,
    }))

    const allProductsForStats = statsRes.data || []
    const totalProducts = productsRes.count || 0
    const totalValue = allProductsForStats.reduce((sum: number, p: any) => {
        const cost = p.cost_cents || 0
        const qty = p.specifications?.quantity_available ?? 1
        return sum + cost * qty
    }, 0)
    const lowStockCount = allProductsForStats.filter((p: any) => {
        const qty = p.specifications?.quantity_available ?? 1
        return qty <= 5
    }).length
    const categoriesCount = categories.length

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Catalog"
                title="Products"
                description="Manage your rental catalog."
                actions={
                    <Button asChild className="h-10 rounded-md bg-[var(--dashboard-accent-gold)] px-4 text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90">
                        <Link href="/admin/products/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Link>
                    </Button>
                }
            />

            <ProductStatsCards
                totalProducts={totalProducts}
                totalValue={totalValue}
                lowStockCount={lowStockCount}
                categoriesCount={categoriesCount}
            />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <SearchInput placeholder="Search products..." />
                    <ProductFilters categories={categories} />
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                </Tabs>

                <ProductsTable products={tableProducts as any} categories={categories} />

                <PaginationControls
                    currentPage={currentPage}
                    totalCount={totalProducts}
                    pageSize={pageSize}
                    hasNextPage={currentPage * pageSize < totalProducts}
                    hasPrevPage={currentPage > 1}
                />
            </div>
        </AdminPage>
    )
}
