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
import { Eye, Pencil, Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function PortfolioAdminPage() {
    const supabase = await createClient()

    const { data: categories } = await supabase
        .from('portfolio_categories')
        .select('*')
        .order('name')

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Management
                        </span>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                            Portfolio
                        </h1>
                        <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md mt-2">
                            Manage your event galleries and portfolio categories.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-6">
                        <Link href="/admin/portfolio/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="glass-card border-none overflow-hidden rounded-3xl">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-[var(--dashboard-border)] hover:bg-transparent">
                                <TableHead className="w-[100px] py-6 text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider text-[10px] pl-8">Image</TableHead>
                                <TableHead className="py-6 text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider text-[10px]">Name</TableHead>
                                <TableHead className="py-6 text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider text-[10px]">Slug</TableHead>
                                <TableHead className="py-6 text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider text-[10px]">Description</TableHead>
                                <TableHead className="text-right py-6 text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider text-[10px] pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories?.map((category) => (
                                <TableRow key={category.id} className="border-b border-[var(--dashboard-border)]/50 hover:bg-[var(--dashboard-card-hover)] transition-colors group">
                                    <TableCell className="py-4 pl-8">
                                        <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-[var(--dashboard-border)] transition-transform duration-300 group-hover:scale-105">
                                            <Image
                                                src={category.cover_image || '/images/gallery-hero.png'}
                                                alt={category.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-[var(--dashboard-text)]">
                                        {category.name}
                                    </TableCell>
                                    <TableCell className="text-[var(--dashboard-text-muted)] font-mono text-xs">
                                        {category.slug}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-[var(--dashboard-text-muted)] font-light">
                                        {category.description}
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex items-center justify-end gap-2 text-[var(--dashboard-text-muted)]">
                                            <Button variant="ghost" size="icon" asChild className="hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)] rounded-lg">
                                                <Link href={`/admin/portfolio/${category.id}`}>
                                                    <ImageIcon className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild className="hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)] rounded-lg">
                                                <Link href={`/admin/portfolio/${category.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:bg-red-500/10 hover:text-red-500 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <ImageIcon className="h-10 w-10" />
                                            <p className="text-sm">No portfolio categories found</p>
                                        </div>
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
