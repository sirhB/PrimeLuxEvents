'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteConfirmationModal } from '@/components/admin/delete-confirmation-modal'
import { deletePortfolioCategory } from './actions'
import { toast } from 'sonner'

interface PortfolioTableProps {
    categories: any[]
}

export function PortfolioTable({ categories }: PortfolioTableProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<any>(null)

    const handleDelete = async () => {
        if (!categoryToDelete) return

        setIsDeleting(true)
        try {
            const result = await deletePortfolioCategory(categoryToDelete.id)
            if (result.error) throw new Error(result.error)

            toast.success('Portfolio category deleted')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsDeleting(false)
            setCategoryToDelete(null)
        }
    }

    return (
        <>
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
                    {categories.map((category) => (
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-red-500/10 hover:text-red-500 rounded-lg"
                                        onClick={() => setCategoryToDelete(category)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {categories.length === 0 && (
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

            <DeleteConfirmationModal
                open={!!categoryToDelete}
                onOpenChange={(open) => !open && setCategoryToDelete(null)}
                onConfirm={handleDelete}
                itemName={categoryToDelete?.name}
                isLoading={isDeleting}
                description="This will permanently delete this portfolio category and all associated images."
            />
        </>
    )
}
