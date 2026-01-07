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
import { Plus, Pencil, Trash2, Eye, FolderTree } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { Card, CardContent } from '@/components/ui/card'
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
        .select('*', { count: 'exact' })

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

    const { data: categories, count } = await query.range(start, end)

    async function deleteCategory(id: string) {
        'use server'
        const supabase = await createClient()
        await supabase.from('categories').delete().eq('id', id)
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

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="all">All Categories</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                    <div className="flex flex-col xxl:flex-row gap-6 items-start xxl:items-center justify-between glass-morphism p-6 rounded-3xl border border-border/50">
                        <div className="w-full max-w-md">
                            <SearchInput placeholder="Search categories..." />
                        </div>
                    </div>

                    <CategoriesTable categories={categories || []} onDelete={deleteCategory} />

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
                    <div className="flex items-center justify-center h-60 bg-card/30 rounded-3xl border border-dashed border-border/50 backdrop-blur-sm">
                        <div className="text-center">
                            <FolderTree className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-light">Active categories view coming soon</p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
