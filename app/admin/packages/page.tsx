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
import { formatCurrency } from '@/lib/utils'

export default async function PackagesPage() {
    const supabase = await createClient()
    const { data: packages } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false })

    async function deletePackage(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const supabase = await createClient()
        await supabase.from('packages').delete().eq('id', id)
        revalidatePath('/admin/packages')
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your rental packages and deals
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/packages/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Package
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Featured</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages?.map((pkg) => (
                                <TableRow key={pkg.id}>
                                    <TableCell className="font-medium">{pkg.name}</TableCell>
                                    <TableCell>{formatCurrency(pkg.price)}</TableCell>
                                    <TableCell>{pkg.is_featured ? 'Yes' : 'No'}</TableCell>
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
                                    <TableCell colSpan={4} className="text-center">
                                        No packages found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
