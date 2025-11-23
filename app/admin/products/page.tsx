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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/admin/search-input'
import { PaginationControls } from '@/components/admin/pagination-controls'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ category_id?: string; page?: string; search?: string }>
}) {
    const { category_id, page = '1', search } = await searchParams
    const supabase = await createClient()

    const currentPage = parseInt(page)
    const pageSize = 10
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
        .from('products')
        .select('*, categories(name)', { count: 'exact' })
        .order('created_at', { ascending: false })

    if (category_id) {
        query = query.eq('category_id', category_id)
    }

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data: products, count } = await query.range(start, end)

    async function deleteProduct(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const supabase = await createClient()
        await supabase.from('products').delete().eq('id', id)
        revalidatePath('/admin/products')
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground mt-1">
                        {category_id ? 'Viewing products in selected category' : 'Manage your product catalog and inventory'}
                    </p>
                    {category_id && (
                        <Button variant="link" asChild className="p-0 h-auto text-[var(--dashboard-accent-gold)]">
                            <Link href="/admin/products">Clear Filter</Link>
                        </Button>
                    )}
                </div>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput placeholder="Search products..." />
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
                                            <form action={deleteProduct}>
                                                <input type="hidden" name="id" value={product.id} />
                                                <Button variant="ghost" size="icon" type="submit">
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </form>
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
        </div>
    )
}
