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
import { Plus, Trash, X, Search, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from './image-upload'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'


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
    const [mainImage, setMainImage] = useState(product?.image_url ? [product.image_url] : [])
    const [galleryImages, setGalleryImages] = useState<string[]>(product?.images || [])
    interface AssemblyItem {
        name: string
        quantity: number
    }

    // Helper to parse existing items which might be strings or objects
    const parseAssemblyItems = (items: any[]): AssemblyItem[] => {
        if (!items) return []
        return items.map(item => {
            if (typeof item === 'string') {
                return { name: item, quantity: 1 }
            }
            return item as AssemblyItem
        })
    }

    const [assemblyItems, setAssemblyItems] = useState<AssemblyItem[]>(parseAssemblyItems(product?.assembly_items))

    // Variant Grouping State
    const [openVariantSearch, setOpenVariantSearch] = useState(false)
    const [variantSearchQuery, setVariantSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [linkedProduct, setLinkedProduct] = useState<any>(null) // The product we want to group with

    // Search for products to group with
    const searchProducts = async (query: string) => {
        setVariantSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        setSearching(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, color, group_id, image_url')
                .ilike('name', `%${query}%`)
                .neq('id', product?.id || 'new') // Exclude current product
                .limit(5)

            if (error) throw error
            setSearchResults(data || [])
        } catch (error) {
            console.error('Error searching products:', error)
        } finally {
            setSearching(false)
        }
    }

    const handleSelectProduct = async (selectedProduct: any) => {
        // If the selected product has a group_id, we use it.
        // If it doesn't, we will generate one, assign it to OUR form, AND we need to update the other product.

        let targetGroupId = selectedProduct.group_id

        if (!targetGroupId) {
            // Case 1: Target product has no group. We allow this, but we'll need to update it.
            // For now, we'll generate a UUID and effectively "Propose" it. 
            // The actual update of the OTHER product happens best if we do it now.

            const newGroupId = crypto.randomUUID()

            try {
                // We update the OTHER product immediately to start the group
                const { error } = await supabase
                    .from('products')
                    .update({ group_id: newGroupId, color: selectedProduct.color || 'Original' }) // Default color if missing
                    .eq('id', selectedProduct.id)

                if (error) throw error

                targetGroupId = newGroupId
                toast.success(`Created new variant group with ${selectedProduct.name}`)
            } catch (error) {
                toast.error("Failed to update the selected product. Please try again.")
                return
            }
        } else {
            toast.success(`Joining group with ${selectedProduct.name}`)
        }

        // Set the group_id on our form
        const input = document.getElementById('group_id') as HTMLInputElement
        if (input) input.value = targetGroupId
        setLinkedProduct(selectedProduct)
        setOpenVariantSearch(false)
    }

    const addAssemblyItem = () => {
        setAssemblyItems([...assemblyItems, { name: '', quantity: 1 }])
    }

    const removeAssemblyItem = (index: number) => {
        setAssemblyItems(assemblyItems.filter((_, i) => i !== index))
    }

    const updateAssemblyItem = (index: number, field: keyof AssemblyItem, value: any) => {
        const newItems = [...assemblyItems]
        newItems[index] = { ...newItems[index], [field]: value }
        setAssemblyItems(newItems)
    }

    // Modifier State & Handlers
    // Convert modifier price adjustments from cents to dollars for display
    const modifiersInDollars = product?.modifiers?.map((m: Modifier) => ({
        ...m,
        options: m.options?.map(o => ({
            ...o,
            priceAdjustment: o.priceAdjustment / 100
        })) || []
    })) || []
    const [modifiers, setModifiers] = useState<Modifier[]>(modifiersInDollars)

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
                        ...(m.options || []),
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
                    options: m.options?.filter(o => o.id !== optionId) || []
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
                    options: m.options?.map(o => {
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
        // Convert price from dollars to cents for storage
        const priceInDollars = parseFloat(formData.get('price') as string)
        const priceInCents = Math.round(priceInDollars * 100)

        // Convert modifier price adjustments from dollars to cents
        const modifiersInCents = modifiers.map(m => ({
            ...m,
            options: m.options?.map(o => ({
                ...o,
                priceAdjustment: Math.round(o.priceAdjustment * 100)
            })) || []
        }))

        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: priceInCents,
            stock: parseInt(formData.get('stock') as string),
            category_id: (formData.get('category_id') as string) || null,
            image_url: mainImage[0] || null,
            images: galleryImages,
            is_featured: formData.get('is_featured') === 'on',
            slug: formData.get('slug') as string,
            modifiers: modifiersInCents,
            assembly_items: assemblyItems.filter(item => item.name.trim() !== ''),
            group_id: (formData.get('group_id') as string) || null,
            color: (formData.get('color') as string) || null,
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
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={product?.name}
                            onChange={(e) => {
                                const name = e.target.value
                                const slugInput = document.getElementById('slug') as HTMLInputElement
                                const categorySelect = document.getElementsByName('category_id')[0] as HTMLSelectElement

                                if (slugInput && (!slugInput.value || slugInput.value === product?.slug || slugInput.dataset.auto === 'true')) {
                                    const base = name
                                    slugInput.value = base
                                        .toLowerCase()
                                        .replace(/[^a-z0-9\s]/g, '')
                                        .trim()
                                        .replace(/\s+/g, '-')
                                    slugInput.dataset.auto = 'true'
                                }
                            }}
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Product Slug (URL)</Label>
                        <Input
                            id="slug"
                            name="slug"
                            defaultValue={product?.slug}
                            onChange={(e) => {
                                e.target.dataset.auto = 'false'
                            }}
                            placeholder="category-product-name"
                            required
                        />
                        <p className="text-xs text-muted-foreground">This will be used in the URL: /catalog/category-slug/product-slug</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="group_id">Variant Group ID</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="group_id"
                                    name="group_id"
                                    defaultValue={product?.group_id || ''}
                                    placeholder="UUID for grouping variants"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title="Generate New Group ID"
                                    onClick={() => {
                                        const input = document.getElementById('group_id') as HTMLInputElement;
                                        if (input) input.value = crypto.randomUUID();
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Products with the same Group ID will be linked as color variants.</p>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Label htmlFor="color">Color Variant</Label>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Input
                                        id="color"
                                        name="color"
                                        defaultValue={product?.color || ''}
                                        placeholder="Variant Name (e.g. Gold, Red)"
                                    />
                                </div>

                                <Card className="bg-muted/30 border-dashed">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Group Assignment</Label>
                                            {linkedProduct && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Linked to: {linkedProduct.name}
                                                </Badge>
                                            )}
                                        </div>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="w-full justify-start text-muted-foreground hover:text-foreground"
                                            onClick={() => setOpenVariantSearch(true)}
                                        >
                                            <LinkIcon className="mr-2 h-4 w-4" />
                                            {linkedProduct || product?.group_id
                                                ? "Change Linked Product Group..."
                                                : "Search for product to group with..."
                                            }
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <CommandDialog open={openVariantSearch} onOpenChange={setOpenVariantSearch}>
                            <CommandInput
                                placeholder="Search products..."
                                value={variantSearchQuery}
                                onValueChange={searchProducts}
                            />
                            <CommandList>
                                <CommandEmpty>No products found.</CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    {searchResults.map((result) => (
                                        <CommandItem
                                            key={result.id}
                                            onSelect={() => handleSelectProduct(result)}
                                            className="flex items-center gap-3 p-2 cursor-pointer"
                                        >
                                            <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0 relative">
                                                {result.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={result.image_url} alt={result.name} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-secondary" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{result.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {result.color ? `Color: ${result.color}` : 'No color set'}
                                                    {result.group_id && ' • Has Group'}
                                                </span>
                                            </div>
                                            {result.group_id && (
                                                <Badge variant="outline" className="ml-auto text-[10px]">Existing Group</Badge>
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </CommandDialog>
                    </div>
                    {/* Replaced old color input with new section above, removing this block to avoid duplicates if any */}

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={product?.description}
                            placeholder="Describe the product..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={product?.price ? (product.price / 100).toFixed(2) : ''}
                                placeholder="0.00"
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
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category_id">Category</Label>
                            <Select
                                name="category_id"
                                defaultValue={product?.category_id}
                                onValueChange={(value) => {
                                    const nameInput = document.getElementById('name') as HTMLInputElement
                                    const slugInput = document.getElementById('slug') as HTMLInputElement
                                    if (nameInput && slugInput && (slugInput.dataset.auto === 'true' || !slugInput.value || slugInput.value === product?.slug)) {
                                        const name = nameInput.value
                                        const base = name
                                        slugInput.value = base
                                            .toLowerCase()
                                            .replace(/[^a-z0-9\s]/g, '')
                                            .trim()
                                            .replace(/\s+/g, '-')
                                        slugInput.dataset.auto = 'true'
                                    }
                                }}
                            >
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
                    </div>

                    <div className="space-y-4">
                        <Label>Main Product Image</Label>
                        <ImageUpload
                            value={mainImage}
                            onChange={(urls) => setMainImage(urls)}
                            multiple={false}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="is_featured" name="is_featured" defaultChecked={product?.is_featured} />
                        <Label htmlFor="is_featured" className="!mb-0">Featured Product</Label>
                    </div>
                </CardContent>
            </Card>

            {/* Product Gallery */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                    <ImageUpload
                        value={galleryImages}
                        onChange={(urls) => setGalleryImages(urls)}
                        multiple={true}
                    />
                </CardContent>
            </Card>

            {/* Assembly Items */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Assembly Items</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addAssemblyItem}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {assemblyItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <Input
                                value={item.name}
                                onChange={(e) => updateAssemblyItem(index, 'name', e.target.value)}
                                placeholder="Part Name (e.g. Legs)"
                                className="flex-1"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">Qty</span>
                                <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateAssemblyItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-20"
                                    min={1}
                                />
                            </div>
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
                        <p className="text-sm text-muted-foreground italic text-center py-4">No assembly items added.</p>
                    )}
                </CardContent>
            </Card>

            {/* Modifiers */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Product Modifiers</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addModifier}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Modifier
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {modifiers.map((modifier, index) => (
                        <Card key={modifier.id} className="border-2">
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
                                    {modifier.options?.map((option, optIndex) => (
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
                    {modifiers.length === 0 && (
                        <p className="text-sm text-muted-foreground italic text-center py-4">No modifiers added.</p>
                    )}
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-xl border shadow-lg">
                <Button type="submit" disabled={loading} className="flex-1">
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
