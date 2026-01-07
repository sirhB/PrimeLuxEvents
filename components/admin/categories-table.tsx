'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Eye, FolderTree, MoreVertical } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
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

            <div className="rounded-[var(--radius)] border border-border bg-card/30 backdrop-blur-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-border/50">
                            <TableCell className="w-12">
                                <Checkbox
                                    checked={selectedIds.length === categories.length && categories.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </TableCell>
                            <SortableHeader column="name" label="Name" className="min-w-[200px]" />
                            <SortableHeader column="slug" label="Slug" />
                            <TableCell>Description</TableCell>
                            <TableCell className="text-right">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow
                                key={category.id}
                                data-state={selectedIds.includes(category.id) ? 'selected' : ''}
                                className="group/row transition-colors"
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.includes(category.id)}
                                        onCheckedChange={() => toggleOne(category.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                            <FolderTree className="h-4 w-4 text-muted-foreground opacity-50" />
                                        </div>
                                        <span className="truncate group-hover/row:text-primary transition-colors">
                                            {category.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                                        {category.slug}
                                    </code>
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-md truncate font-light text-sm">
                                    {category.description || 'No description provided.'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon-sm" asChild>
                                            <Link href={`/admin/products?category_id=${category.id}`}>
                                                <Eye className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" asChild>
                                            <Link href={`/admin/categories/${category.id}`}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" onClick={() => onDelete(category.id)}>
                                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm">
                                            <MoreVertical className="h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                        <FolderTree className="h-8 w-8" />
                                        <p>No categories found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
