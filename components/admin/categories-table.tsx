'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Eye, FolderTree, MoreVertical } from 'lucide-react'
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

interface Category {
    id: string
    name: string
    slug: string
    description: string
}

interface CategoriesTableProps {
    categories: Category[]
    onDelete: (id: string) => Promise<void>
}

export function CategoriesTable({ categories, onDelete }: CategoriesTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

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

    return (
        <div className="relative">
            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="sticky bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-full glass-morphism border border-[var(--dashboard-accent-gold)] shadow-2xl bg-black/80 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold text-[var(--dashboard-accent-gold)] uppercase tracking-widest px-2">
                            {selectedIds.length} Selected
                        </span>
                        <div className="w-px h-6 bg-border/50 mx-2" />
                        <Button size="sm" variant="ghost" className="hover:bg-red-500/10 hover:text-red-500 rounded-full font-bold uppercase text-[10px] tracking-wider">
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="rounded-full font-bold uppercase text-[10px] tracking-wider">
                            Cancel
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <Card className="border-none glass-card overflow-hidden">
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
                                <SortableHeader column="name" label="Category Name" className="min-w-[200px]" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                <SortableHeader column="slug" label="Slug" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Description</TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow
                                key={category.id}
                                data-state={selectedIds.includes(category.id) ? 'selected' : ''}
                                className="group/row hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors"
                            >
                                <TableCell className="pl-6">
                                    <Checkbox
                                        checked={selectedIds.includes(category.id)}
                                        onCheckedChange={() => toggleOne(category.id)}
                                        className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]"
                                    />
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0 border border-[var(--dashboard-border)] transition-colors group-hover/row:border-[var(--dashboard-accent-gold)]/30">
                                            <FolderTree className="h-5 w-5 text-[var(--dashboard-accent-gold)] opacity-50" />
                                        </div>
                                        <span className="font-serif text-lg text-[var(--dashboard-text)] truncate transition-colors group-hover/row:text-[var(--dashboard-accent-gold)]">
                                            {category.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="px-2 py-1 rounded bg-black/30 text-[10px] text-[var(--dashboard-accent-gold)] font-mono border border-[var(--dashboard-border)]">
                                        {category.slug}
                                    </code>
                                </TableCell>
                                <TableCell className="text-[var(--dashboard-text-muted)] max-w-md truncate font-light text-sm italic opacity-70">
                                    {category.description || 'No description provided.'}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                                        <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild title="View Products">
                                            <Link href={`/admin/products?category_id=${category.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild title="Edit Category">
                                            <Link href={`/admin/categories/${category.id}`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500" onClick={() => onDelete(category.id)} title="Delete Category">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-60 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                                        <FolderTree className="h-10 w-10 text-[var(--dashboard-text-muted)]" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">No categories found</p>
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
