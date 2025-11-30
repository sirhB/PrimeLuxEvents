'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Package, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Task {
    id: string
    order_id?: string | null
    delivery_items?: any[]
}

interface DeliveryItem {
    product_id: string
    name: string
    quantity: number
    loaded: boolean
}

export function LoadItemsDialog({ task }: { task: Task }) {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<DeliveryItem[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (open) {
            fetchItems()
        }
    }, [open])

    async function fetchItems() {
        setLoading(true)
        try {
            // If we already have saved progress, use it
            if (task.delivery_items && task.delivery_items.length > 0) {
                setItems(task.delivery_items)
                setLoading(false)
                return
            }

            // Otherwise fetch from order
            if (!task.order_id) {
                setItems([])
                setLoading(false)
                return
            }

            const { data: orderItems, error } = await supabase
                .from('order_items')
                .select(`
                    quantity,
                    products (
                        id,
                        name
                    )
                `)
                .eq('order_id', task.order_id)

            if (error) throw error

            const initialItems: DeliveryItem[] = orderItems.map((item: any) => ({
                product_id: item.products.id,
                name: item.products.name,
                quantity: item.quantity,
                loaded: false
            }))

            setItems(initialItems)
        } catch (error) {
            console.error('Error fetching items:', error)
            toast.error('Failed to load items')
        } finally {
            setLoading(false)
        }
    }

    async function saveProgress() {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    delivery_items: items,
                    updated_at: new Date().toISOString()
                })
                .eq('id', task.id)

            if (error) throw error

            toast.success('Loading progress saved')
            setOpen(false)
        } catch (error) {
            console.error('Error saving progress:', error)
            toast.error('Failed to save progress')
        } finally {
            setSaving(false)
        }
    }

    const toggleItem = (index: number) => {
        setItems(prev => {
            const newItems = [...prev]
            newItems[index].loaded = !newItems[index].loaded
            return newItems
        })
    }

    const allLoaded = items.length > 0 && items.every(i => i.loaded)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8">
                    <Package className="h-3.5 w-3.5 mr-2" />
                    Load Items
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Load Items</DialogTitle>
                    <DialogDescription>
                        Check off items as they are loaded into the vehicle.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No items found for this task.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${item.loaded ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => toggleItem(index)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox checked={item.loaded} onCheckedChange={() => toggleItem(index)} />
                                        <div>
                                            <p className={`font-medium ${item.loaded ? 'text-green-900' : 'text-gray-900'}`}>
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    {item.loaded && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={saveProgress} disabled={saving || loading}>
                        {saving ? 'Saving...' : allLoaded ? 'Complete Loading' : 'Save Progress'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
