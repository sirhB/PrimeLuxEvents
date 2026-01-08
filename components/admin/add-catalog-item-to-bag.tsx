'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddCatalogItemToBagProps {
    bagId: string
    onSuccess: () => void
}

export function AddCatalogItemToBag({ bagId, onSuccess }: AddCatalogItemToBagProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [adding, setAdding] = useState<string | null>(null)
    const supabase = createClient()

    const handleSearch = async (query: string) => {
        setSearch(query)
        if (query.length < 2) {
            setProducts([])
            return
        }

        setLoading(true)
        const { data } = await supabase
            .from('products')
            .select('id, name, image_url')
            .ilike('name', `%${query}%`)
            .limit(5)

        if (data) setProducts(data)
        setLoading(false)
    }

    const addToBag = async (productId: string) => {
        if (quantity < 1) {
            toast.error('Quantity must be at least 1')
            return
        }
        setAdding(productId)
        try {
            const { error } = await supabase
                .from('bag_catalog_items')
                .insert({
                    bag_id: bagId,
                    product_id: productId,
                    quantity: quantity
                })

            if (error) throw error
            toast.success('Product added to bag')
            onSuccess()
            setQuantity(1) // Reset quantity
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setAdding(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl bg-black text-white hover:bg-gold hover:text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Catalog Item
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Add to Bag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 rounded-xl h-12"
                            />
                        </div>
                        <div className="w-24">
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="rounded-xl h-12 text-center"
                                placeholder="Qty"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                            </div>
                        ) : products.length > 0 ? (
                            products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <Search className="h-4 w-4 text-gray-400" />
                                            </div>
                                        )}
                                        <p className="text-sm font-bold truncate max-w-[150px]">{product.name}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-lg h-8 w-8 p-0 hover:bg-black hover:text-white"
                                        onClick={() => addToBag(product.id)}
                                        disabled={adding === product.id}
                                    >
                                        {adding === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                </div>
                            ))
                        ) : search.length >= 2 ? (
                            <p className="text-center py-8 text-gray-400 text-sm">No products found.</p>
                        ) : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
