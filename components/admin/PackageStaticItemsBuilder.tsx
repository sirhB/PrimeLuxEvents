'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Search, Plus } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export type PackageStaticItem = {
    id: string // temporary or real ID
    product_id: string
    product_name: string
    quantity: number
}

interface PackageStaticItemsBuilderProps {
    initialItems?: PackageStaticItem[]
    products: any[]
    onChange: (items: PackageStaticItem[]) => void
}

export default function PackageStaticItemsBuilder({
    initialItems = [],
    products,
    onChange
}: PackageStaticItemsBuilderProps) {
    const [items, setItems] = useState<PackageStaticItem[]>(initialItems)
    const [searchTerm, setSearchTerm] = useState('')

    const addItem = (productId: string) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        // Check if already exists
        const existingItem = items.find(i => i.product_id === productId)
        if (existingItem) {
            // Update quantity instead
            updateItem(existingItem.id, 'quantity', existingItem.quantity + 1)
            return
        }

        const newItem: PackageStaticItem = {
            id: `static-${Date.now()}`,
            product_id: productId,
            product_name: product.name,
            quantity: 1
        }

        const newItems = [...items, newItem]
        setItems(newItems)
        onChange(newItems)
    }

    const removeItem = (itemId: string) => {
        const newItems = items.filter(i => i.id !== itemId)
        setItems(newItems)
        onChange(newItems)
    }

    const updateItem = (itemId: string, field: keyof PackageStaticItem, value: any) => {
        const newItems = items.map(i => {
            if (i.id === itemId) {
                return { ...i, [field]: value }
            }
            return i
        })
        setItems(newItems)
        onChange(newItems)
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium">Included Items</h3>
                    <p className="text-sm text-muted-foreground">
                        Items that are always included in this package (e.g. 10 Chairs, 1 Table).
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Select onValueChange={addItem}>
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder="Add product to package..." />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder="Search products..."
                                        className="h-8 mb-2"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {filteredProducts.slice(0, 10).map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        {items.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                No static items added. Use the search above to add items.
                            </div>
                        )}

                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-secondary/10 p-3 rounded-lg border">
                                <div className="flex-1 font-medium">{item.product_name}</div>

                                <div className="flex items-center gap-2">
                                    <Label className="text-sm whitespace-nowrap">Qty Included:</Label>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-500"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
