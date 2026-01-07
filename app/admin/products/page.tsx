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
import { Plus, Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'
import { ProductFilters } from '@/components/admin/product-filters'
import { DeleteProductButton } from '@/components/admin/delete-product-button'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category_id?: string; page?: string; search?: string; sort?: string }>
}) {
    const { category_id, page = '1', search, sort = 'newest' } = await searchParams
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Inventory
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Products
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Manage your product catalog, pricing, and inventory levels.
                    </p>
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
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="all">All Products</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <SearchInput placeholder="Search products..." />
                        <ProductFilters categories={categories || []} />
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products?.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.categories?.name || 'Uncategorized'}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                }).format(product.price / 100)}
                                            </TableCell>
                                            <TableCell>{product.stock}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild title="Edit Product">
                                                        <Link href={`/admin/products/${product.id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Link>
                                                    </Button>
                                                    <DeleteProductButton id={product.id} productName={product.name} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {products?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No products found.
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
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-40 bg-white rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Inventory management view coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
