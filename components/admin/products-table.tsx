'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, MoreVertical, Trash2, Package as PackageIcon, AlertCircle } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { SortableHeader } from '@/components/admin/sortable-header'
import { formatCents } from '@/lib/format-money'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
    id: string
    name: string
    price: number
    stock: number
    categories: { name: string } | null
}

interface ProductsTableProps {
    products: any[]
}

export function ProductsTable({ products }: ProductsTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const toggleAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(products.map(p => p.id))
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
                        <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary rounded-full font-bold uppercase text-[10px] tracking-wider">
                            Change Category
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
                                    checked={selectedIds.length === products.length && products.length > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </TableCell>
                            <SortableHeader column="name" label="Name" className="min-w-[250px]" />
                            <SortableHeader column="category" label="Category" />
                            <SortableHeader column="price" label="Price" />
                            <SortableHeader column="stock" label="Stock" />
                            <TableCell className="text-right">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product, index) => {
                            const isLowStock = product.stock <= 5 && product.stock > 0
                            const isOutOfStock = product.stock === 0

                            return (
                                <TableRow
                                    key={product.id}
                                    data-state={selectedIds.includes(product.id) ? 'selected' : ''}
                                    className="group/row transition-colors"
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(product.id)}
                                            onCheckedChange={() => toggleOne(product.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <PackageIcon className="h-4 w-4 text-muted-foreground opacity-50" />
                                            </div>
                                            <span className="truncate group-hover/row:text-primary transition-colors">
                                                {product.name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2.5 py-1 rounded-full bg-muted/30 text-[10px] uppercase font-bold tracking-widest text-muted-foreground border border-border/50">
                                            {product.categories?.name || 'Uncategorized'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-serif">
                                        {formatCents(product.price)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "font-bold",
                                                isOutOfStock ? "text-red-500" : isLowStock ? "text-orange-500" : "text-foreground"
                                            )}>
                                                {product.stock}
                                            </span>
                                            {isLowStock && (
                                                <AlertCircle className="h-3 w-3 text-orange-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon-sm" asChild>
                                                <Link href={`/admin/products/${product.id}`}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                            <DeleteProductButton id={product.id} productName={product.name} />
                                            <Button variant="ghost" size="icon-sm">
                                                <MoreVertical className="h-3.5 w-3.5 opacity-50" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                        <PackageIcon className="h-8 w-8" />
                                        <p>No products found matching your filters.</p>
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
