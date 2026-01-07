'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, MoreVertical, Trash2, Package as PackageIcon, AlertCircle } from 'lucide-react'
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
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import { SortableHeader } from '@/components/admin/sortable-header'
import { formatCents, formatCentsWithCommas } from '@/lib/format-money'
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

            <Card className="border-none glass-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-black/20">
                        <TableRow className="hover:bg-transparent border-b border-[var(--dashboard-border)]">
                            <TableHead className="w-12 pl-6">
                                <Checkbox
                                    checked={selectedIds.length === products.length && products.length > 0}
                                    onCheckedChange={toggleAll}
                                    className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]"
                                />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] py-4">
                                <SortableHeader column="name" label="Product Name" className="min-w-[250px]" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                <SortableHeader column="category" label="Category" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                <SortableHeader column="price" label="Price" />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                <SortableHeader column="stock" label="Inventory" />
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] pr-6">Actions</TableHead>
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
                                    className="group/row hover:bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] transition-colors"
                                >
                                    <TableCell className="pl-6">
                                        <Checkbox
                                            checked={selectedIds.includes(product.id)}
                                            onCheckedChange={() => toggleOne(product.id)}
                                            className="border-[var(--dashboard-border)] data-[state=checked]:bg-[var(--dashboard-accent-gold)] data-[state=checked]:border-[var(--dashboard-accent-gold)]"
                                        />
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0 border border-[var(--dashboard-border)] transition-colors group-hover/row:border-[var(--dashboard-accent-gold)]/30">
                                                <PackageIcon className="h-5 w-5 text-[var(--dashboard-accent-gold)] opacity-50" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-serif text-lg text-[var(--dashboard-text)] truncate transition-colors group-hover/row:text-[var(--dashboard-accent-gold)]">
                                                    {product.name}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                                    SKU: {product.sku || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-black/20 text-[var(--dashboard-text-muted)] border border-[var(--dashboard-border)]">
                                            {product.categories?.name || 'Uncategorized'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono font-bold text-[var(--dashboard-text)]">
                                        {formatCentsWithCommas(product.price)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "font-mono font-bold text-base",
                                                isOutOfStock ? "text-red-500" : isLowStock ? "text-orange-500" : "text-[var(--dashboard-accent-gold)]"
                                            )}>
                                                {product.stock}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)] opacity-50">Units</span>
                                            {isLowStock && (
                                                <AlertCircle className="h-3 w-3 text-orange-500 animate-pulse" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-300">
                                            <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]" asChild>
                                                <Link href={`/admin/products/${product.id}`}>
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DeleteProductButton id={product.id} productName={product.name} />
                                            <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-lg hover:bg-[var(--dashboard-accent-gold)]/10 hover:text-[var(--dashboard-accent-gold)]">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-60 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                                        <PackageIcon className="h-10 w-10 text-[var(--dashboard-text-muted)]" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)]">No products found</p>
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
