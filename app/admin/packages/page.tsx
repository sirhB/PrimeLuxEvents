import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Package, Tag, Percent, DollarSign } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default async function PackagesPage() {
    const supabase = await createClient()
    const { data: packages } = await supabase
        .from('packages')
        .select('*, package_item_groups(count)')
        .order('created_at', { ascending: false })

    // Calculate stats
    const totalPackages = packages?.length || 0
    const activePackages = packages?.filter(p => !p.is_featured).length || 0 // Assuming non-featured are still active, logic might need adjustment based on requirements
    const featuredPackages = packages?.filter(p => p.is_featured).length || 0
    const totalSavings = packages?.reduce((acc, curr) => acc + (curr.savings_amount || 0), 0) || 0

    async function deletePackage(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const supabase = await createClient()
        await supabase.from('packages').delete().eq('id', id)
        revalidatePath('/admin/packages')
    }

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Bundles"
                title="Packages"
                description="Manage your rental packages, bundles, and discounts."
                actions={
                    <Button asChild className="h-10 rounded-md bg-[var(--dashboard-accent-gold)] px-4 text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90">
                        <Link href="/admin/packages/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Package
                        </Link>
                    </Button>
                }
            />

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">Total Packages</CardTitle>
                        <Package className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-[var(--dashboard-text)]">{totalPackages}</div>
                    </CardContent>
                </Card>
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">Featured</CardTitle>
                        <Tag className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-[var(--dashboard-text)]">{featuredPackages}</div>
                    </CardContent>
                </Card>
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">Avg. Discount</CardTitle>
                        <Percent className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-[var(--dashboard-text)]">
                            {packages?.length ? Math.round(packages.reduce((acc, p) => acc + (p.discount_type === 'percentage' ? p.discount_value : 0), 0) / packages.length) : 0}%
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none glass-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">Total Savings</CardTitle>
                        <DollarSign className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-[var(--dashboard-text)]">{formatCurrency(totalSavings)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="packages" className="w-full">
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

                <TabsList className="bg-white/5 border-none p-0.5 mb-6 w-fit h-8">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-[10px] uppercase font-bold tracking-widest px-4 h-7 rounded-lg">All Packages</TabsTrigger>
                    <TabsTrigger value="featured" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-[10px] uppercase font-bold tracking-widest px-4 h-7 rounded-lg">Featured Only</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6 animate-fade-in">
                    <Card className="border-none glass-card overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-black/20">
                                    <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4 pl-6">Package Name</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Price</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Original Value</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Savings</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Status</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packages?.map((pkg) => (
                                        <TableRow key={pkg.id} className="hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors">
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-semibold text-[var(--dashboard-text)]">{pkg.name}</span>
                                                    <span className="text-[10px] text-[var(--dashboard-text-muted)] font-medium uppercase tracking-tight truncate max-w-[300px]">
                                                        {pkg.description}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono font-bold text-[var(--dashboard-text)]">{formatCurrency(pkg.price)}</TableCell>
                                            <TableCell className="text-[var(--dashboard-text-muted)] line-through font-mono">
                                                {pkg.original_price ? formatCurrency(pkg.original_price) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {pkg.savings_amount > 0 && (
                                                    <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)] border border-[var(--dashboard-accent-green)]/20">
                                                        Save {formatCurrency(pkg.savings_amount)}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {pkg.is_featured && (
                                                    <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                                                        Featured
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild>
                                                        <Link href={`/admin/packages/${pkg.id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Link>
                                                    </Button>
                                                    <form action={deletePackage}>
                                                        <input type="hidden" name="id" value={pkg.id} />
                                                        <Button variant="ghost" size="icon-sm" type="submit" className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500">
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </form>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {packages?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <Package className="h-10 w-10 text-[var(--dashboard-text-muted)]" />
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">No packages found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="featured" className="space-y-6 mt-6">
                    <Card className="border-none glass-card overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-black/20">
                                    <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4 pl-6">Package Name</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Price</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Savings</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packages?.filter(p => p.is_featured).map((pkg) => (
                                        <TableRow key={pkg.id} className="hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors">
                                            <TableCell className="text-base font-semibold py-4 pl-6">{pkg.name}</TableCell>
                                            <TableCell className="font-mono font-bold text-[var(--dashboard-text)]">{formatCurrency(pkg.price)}</TableCell>
                                            <TableCell>
                                                {pkg.savings_amount > 0 && (
                                                    <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)] border border-[var(--dashboard-accent-green)]/20">
                                                        Save {formatCurrency(pkg.savings_amount)}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild>
                                                        <Link href={`/admin/packages/${pkg.id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {packages?.filter(p => p.is_featured).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] opacity-30">No featured packages found</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AdminPage>
    )
}
