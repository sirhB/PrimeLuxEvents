'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Trash, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


interface Category {
    id: string
    name: string
}

interface ModifierOption {
    id: string
    label: string
    priceAdjustment: number
}

interface Modifier {
    id: string
    name: string
    options: ModifierOption[]
}

interface ProductFormProps {
    product?: any
    categories: Category[]
}

export function ProductForm({ product, categories }: ProductFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [assemblyItems, setAssemblyItems] = useState<string[]>(product?.assembly_items || [])

    const addAssemblyItem = () => {
        setAssemblyItems([...assemblyItems, ''])
    }

    const removeAssemblyItem = (index: number) => {
        setAssemblyItems(assemblyItems.filter((_, i) => i !== index))
    }

    const updateAssemblyItem = (index: number, value: string) => {
        const newItems = [...assemblyItems]
        newItems[index] = value
        setAssemblyItems(newItems)
    }

    // Modifier State & Handlers
    const [modifiers, setModifiers] = useState<Modifier[]>(product?.modifiers || [])

    const addModifier = () => {
        setModifiers([
            ...modifiers,
            {
                id: crypto.randomUUID(),
                name: '',
                options: []
            }
        ])
    }

    const removeModifier = (id: string) => {
        setModifiers(modifiers.filter(m => m.id !== id))
    }

    const updateModifier = (id: string, field: keyof Modifier, value: any) => {
        setModifiers(modifiers.map(m => {
            if (m.id === id) {
                return { ...m, [field]: value }
            }
            return m
        }))
    }

    const addOption = (modifierId: string) => {
        setModifiers(modifiers.map(m => {
            if (m.id === modifierId) {
                return {
                    ...m,
                    options: [
                        ...m.options,
                        {
                            id: crypto.randomUUID(),
                            label: '',
                            priceAdjustment: 0
                        }
                    ]
                }
            }
            return m
        }))
    }

    const removeOption = (modifierId: string, optionId: string) => {
        setModifiers(modifiers.map(m => {
            if (m.id === modifierId) {
                return {
                    ...m,
                    options: m.options.filter(o => o.id !== optionId)
                }
            }
            return m
        }))
    }

    const updateOption = (modifierId: string, optionId: string, field: keyof ModifierOption, value: any) => {
        setModifiers(modifiers.map(m => {
            if (m.id === modifierId) {
                return {
                    ...m,
                    options: m.options.map(o => {
                        if (o.id === optionId) {
                            return { ...o, [field]: value }
                        }
                        return o
                    })
                }
            }
            return m
        }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            stock: parseInt(formData.get('stock') as string),
            category_id: (formData.get('category_id') as string) || null,
            image_url: formData.get('image_url') as string,
            modifiers: modifiers,
            assembly_items: assemblyItems.filter(item => item.trim() !== ''),
        }

        try {
            if (product) {
                const { error } = await supabase
                    .from('products')
                    .update(data)
                    .eq('id', product.id)
                if (error) throw error
                toast.success('Product updated')
            } else {
                const { error } = await supabase.from('products').insert(data)
                if (error) throw error
                toast.success('Product created')
            }
            router.push('/admin/products')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={product?.name}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={product?.description}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={product?.price}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                        id="stock"
                        name="stock"
                        type="number"
                        defaultValue={product?.stock ?? 0}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select name="category_id" defaultValue={product?.category_id}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={product?.image_url}
                    placeholder="https://..."
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base">Assembly Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAssemblyItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>
                <div className="space-y-2">
                    {assemblyItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                value={item}
                                onChange={(e) => updateAssemblyItem(index, e.target.value)}
                                placeholder="e.g. Legs, Screws, etc."
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAssemblyItem(index)}
                            >
                                <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    {assemblyItems.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No assembly items added.</p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base">Modifiers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addModifier}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Modifier
                    </Button>
                </div>

                {modifiers.map((modifier, index) => (
                    <Card key={modifier.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-4">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor={`modifier-${index}-name`}>Modifier Name</Label>
                                    <Input
                                        id={`modifier-${index}-name`}
                                        value={modifier.name}
                                        onChange={(e) => updateModifier(modifier.id, 'name', e.target.value)}
                                        placeholder="e.g. Size, Color"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mt-6"
                                    onClick={() => removeModifier(modifier.id)}
                                >
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {modifier.options.map((option, optIndex) => (
                                    <div key={option.id} className="flex items-center gap-2">
                                        <Input
                                            placeholder="Option Label"
                                            value={option.label}
                                            onChange={(e) =>
                                                updateOption(modifier.id, option.id, 'label', e.target.value)
                                            }
                                            className="flex-1"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">+$</span>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={option.priceAdjustment}
                                                onChange={(e) =>
                                                    updateOption(
                                                        modifier.id,
                                                        option.id,
                                                        'priceAdjustment',
                                                        parseFloat(e.target.value) || 0
                                                    )
                                                }
                                                className="w-24"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOption(modifier.id, option.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={() => addOption(modifier.id)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Option
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}
