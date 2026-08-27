import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { CategoriesTable } from '@/components/admin/categories-table'

export default async function CategoriesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string; sort?: string }>
}) {
    const { page = '1', search, sort = 'name_asc' } = await searchParams
    const supabase = await createClient()

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('categories')
        .select('*, products(count)', { count: 'exact' })

    if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sort) {
        case 'name_desc':
            query = query.order('name', { ascending: false })
            break
        case 'newest':
            query = query.order('created_at', { ascending: false })
            break
        case 'oldest':
            query = query.order('created_at', { ascending: true })
            break
        case 'name_asc':
        default:
            query = query.order('name', { ascending: true })
            break
    }

    const { data: rawCategories, count } = await query.range(start, end)

    // Transform to flatten product count and match interface
    // Interface expected: id, name, slug, description, image_url, is_featured, product_count, created_at
    const categories = rawCategories?.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image_url: cat.image_url,
        is_featured: cat.is_featured,
        created_at: cat.created_at,
        product_count: cat.products?.[0]?.count || 0
    })) || []

    async function deleteCategory(id: string) {
        'use server'
        const supabase = await createClient()
        await supabase.from('categories').delete().eq('id', id)
        revalidatePath('/admin/categories')
    }

    async function bulkDeleteCategories(ids: string[]) {
        'use server'
        const supabase = await createClient()
        await supabase.from('categories').delete().in('id', ids)
        revalidatePath('/admin/categories')
    }

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
                            Categories
                        </h1>
                        <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md mt-2">
                            Organize your products and manage catalog structure.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                        <Link href="/admin/categories/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="categories" className="w-full">
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

                <TabsContent value="all" className="space-y-6 mt-6 animate-fade-in">
                    <div className="flex flex-col xxl:flex-row gap-6 items-start xxl:items-center justify-between glass-card p-6 rounded-3xl border-none">
                        <div className="w-full max-w-md">
                            <SearchInput placeholder="Search categories..." />
                        </div>
                    </div>

                    <CategoriesTable
                        categories={categories}
                        onDelete={deleteCategory}
                        onBulkDelete={bulkDeleteCategories}
                    />

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

                <TabsContent value="active" className="space-y-6 mt-6">
                    <CategoriesTable
                        categories={categories.filter((c) => (c.product_count || 0) > 0)}
                        onDelete={deleteCategory}
                        onBulkDelete={bulkDeleteCategories}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
