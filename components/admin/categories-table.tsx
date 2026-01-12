'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Eye, FolderTree, MoreVertical, Package, Star, Image as ImageIcon } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { SortableHeader } from '@/components/admin/sortable-header'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import Image from 'next/image'

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    is_featured: boolean
    product_count: number
    created_at: string
}

interface CategoriesTableProps {
    categories: Category[]
    onDelete: (id: string) => Promise<void>
    onBulkDelete: (ids: string[]) => Promise<void>
}

export function CategoriesTable({ categories, onDelete, onBulkDelete }: CategoriesTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)

    const toggleAll = () => {
        if (selectedIds.length === categories.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(categories.map(c => c.id))
        }
    }

    const toggleOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) {
            setIsDeleting(true)
            try {
                await onBulkDelete(selectedIds)
                setSelectedIds([])
                toast.success('Categories deleted successfully')
            } catch (error) {
                toast.error('Failed to delete categories')
            } finally {
                setIsDeleting(false)
            }
        }
    }

    const handleDeleteOne = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await onDelete(id)
                toast.success('Category deleted successfully')
            } catch (error) {
                toast.error('Failed to delete category')
            }
        }
    }

    return (
        <div className="relative">
            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-full glass-morphism border border-[var(--dashboard-accent-gold)] shadow-2xl bg-black/80 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold text-[var(--dashboard-accent-gold)] uppercase tracking-widest px-2">
                            {selectedIds.length} Selected
                        </span>
                        <div className="w-px h-6 bg-white/20 mx-2" />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="hover:bg-red-500/10 hover:text-red-500 rounded-full font-bold uppercase text-[10px] tracking-wider transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedIds([])}
                            className="rounded-full font-bold uppercase text-[10px] tracking-wider hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Card className="border-[var(--dashboard-border)] bg-[var(--dashboard-card)]/50 overflow-hidden shadow-sm backdrop-blur-md">
                <Table>
                    <TableHeader className="bg-black/20">
                        <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                            <TableHead className="w-12 pl-6">
                                <Checkbox
                                    checked={selectedIds.length === categories.length && categories.length > 0}
                                    onCheckedChange={toggleAll}
                                    className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]"
                                />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4">
                                <SortableHeader column="name" label="Category" className="min-w-[200px]" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] text-center w-24">
                                Products
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] w-24">
                                Featured
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                <SortableHeader column="slug" label="Slug" />
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow
                                key={category.id}
                                data-state={selectedIds.includes(category.id) ? 'selected' : ''}
                                className="group/row hover:bg-[var(--dashboard-card-hover)]/50 border-b border-[var(--dashboard-border)] transition-colors"
                            >
                                <TableCell className="pl-6">
                                    <Checkbox
                                        checked={selectedIds.includes(category.id)}
                                        onCheckedChange={() => toggleOne(category.id)}
                                        className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]"
                                    />
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-black/20 overflow-hidden shrink-0 border border-[var(--dashboard-border)] relative group-hover/row:border-[var(--dashboard-accent-gold)]/30 transition-colors">
                                            {category.image_url ? (
                                                <Image
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="h-5 w-5 text-[var(--dashboard-text-muted)] opacity-30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-[var(--dashboard-text)] group-hover/row:text-[var(--dashboard-accent-gold)] transition-colors">
                                                {category.name}
                                            </span>
                                            {category.description && (
                                                <span className="text-xs text-[var(--dashboard-text-muted)] truncate max-w-[200px] font-light">
                                                    {category.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="bg-[var(--dashboard-card)] text-[var(--dashboard-text-muted)] border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card)] font-mono text-[10px]">
                                        <Package className="h-3 w-3 mr-1" />
                                        {category.product_count}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {category.is_featured && (
                                        <Badge className="bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20 text-[10px] font-bold uppercase tracking-wider">
                                            Featured
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <code className="px-2 py-1 rounded bg-black/30 text-[10px] text-[var(--dashboard-text-muted)] font-mono border border-[var(--dashboard-border)]/50">
                                        {category.slug}
                                    </code>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="group-hover/row:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-accent-gold)] transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-[var(--dashboard-card)] border-[var(--dashboard-border)] backdrop-blur-xl">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/products?category_id=${category.id}`} className="cursor-pointer focus:bg-[var(--dashboard-card-hover)] focus:text-[var(--dashboard-text)]">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Products
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/categories/${category.id}`} className="cursor-pointer focus:bg-[var(--dashboard-card-hover)] focus:text-[var(--dashboard-text)]">
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />
                                            <DropdownMenuItem onClick={() => handleDeleteOne(category.id)} className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-60 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 opacity-40">
                                        <div className="h-16 w-16 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center">
                                            <FolderTree className="h-8 w-8 text-[var(--dashboard-text-muted)]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--dashboard-text)]">No categories found</p>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] mt-1">Try adjusting your valid filters</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
