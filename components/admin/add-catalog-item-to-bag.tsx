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
import { Search, Plus, Loader2, Package } from 'lucide-react'
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
            <DialogContent className="rounded-[2.5rem] border-[var(--dashboard-border)] bg-[var(--dashboard-card)] text-[var(--dashboard-text)] shadow-2xl max-w-md p-8">
                <DialogHeader>
                    <DialogTitle className="font-serif text-3xl mb-2">Add to Bag</DialogTitle>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--dashboard-text-muted)]">Select products from catalog</p>
                </DialogHeader>
                <div className="space-y-6 py-6">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)]" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-12 rounded-2xl h-14 bg-black/20 border-[var(--dashboard-border)] focus:ring-2 focus:ring-gold/50"
                            />
                        </div>
                        <div className="w-24">
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className="rounded-2xl h-14 text-center bg-black/20 border-[var(--dashboard-border)] font-black"
                                placeholder="Qty"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--dashboard-text-muted)]">Searching Catalog...</p>
                            </div>
                        ) : products.length > 0 ? (
                            products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all group">
                                    <div className="flex items-center gap-4">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt="" className="w-12 h-12 rounded-xl object-cover shadow-lg" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center border border-[var(--dashboard-border)]">
                                                <Search className="h-5 w-5 text-[var(--dashboard-text-muted)]" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold truncate max-w-[150px] text-[var(--dashboard-text)]">{product.name}</p>
                                            <p className="text-[9px] uppercase font-bold tracking-widest text-[var(--dashboard-text-muted)] mt-0.5">Product Item</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-xl h-10 w-10 p-0 hover:bg-gold hover:text-black transition-all"
                                        onClick={() => addToBag(product.id)}
                                        disabled={adding === product.id}
                                    >
                                        {adding === product.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                    </Button>
                                </div>
                            ))
                        ) : search.length >= 2 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm text-[var(--dashboard-text-muted)]">No products found matching "{search}"</p>
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2rem]">
                                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--dashboard-text-muted)]">Type to start searching</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
