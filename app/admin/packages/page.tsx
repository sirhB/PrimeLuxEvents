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
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Bundles
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Packages
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Manage your rental packages, bundles, and discounts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                        <Link href="/admin/packages/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Package
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPackages}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Featured</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{featuredPackages}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {packages?.length ? Math.round(packages.reduce((acc, p) => acc + (p.discount_type === 'percentage' ? p.discount_value : 0), 0) / packages.length) : 0}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Savings Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSavings)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="all">All Packages</TabsTrigger>
                    <TabsTrigger value="featured">Featured Only</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Package Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Original Value</TableHead>
                                        <TableHead>Savings</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packages?.map((pkg) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{pkg.name}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {pkg.description}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold">{formatCurrency(pkg.price)}</TableCell>
                                            <TableCell className="text-muted-foreground line-through">
                                                {pkg.original_price ? formatCurrency(pkg.original_price) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {pkg.savings_amount > 0 && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        Save {formatCurrency(pkg.savings_amount)}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {pkg.is_featured && (
                                                    <Badge variant="outline" className="border-gold text-gold">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/admin/packages/${pkg.id}`}>
                                                            <Pencil className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Link>
                                                    </Button>
                                                    <form action={deletePackage}>
                                                        <input type="hidden" name="id" value={pkg.id} />
                                                        <Button variant="ghost" size="icon" type="submit">
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </form>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {packages?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No packages found. Create your first package to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="featured" className="space-y-6 mt-6">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Package Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Savings</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {packages?.filter(p => p.is_featured).map((pkg) => (
                                        <TableRow key={pkg.id}>
                                            <TableCell className="font-medium">{pkg.name}</TableCell>
                                            <TableCell>{formatCurrency(pkg.price)}</TableCell>
                                            <TableCell>
                                                {pkg.savings_amount > 0 && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                        Save {formatCurrency(pkg.savings_amount)}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
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
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No featured packages found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
