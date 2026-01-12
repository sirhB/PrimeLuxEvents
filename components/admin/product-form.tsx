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
import { Plus, Trash, X, Search, Link as LinkIcon, AlertCircle, Unlink, Sparkles, Loader2 } from 'lucide-react'
import { aiService } from '@/lib/ai/puter'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from './image-upload'
import { createProductVariant, linkProductVariant, unlinkProductVariant } from '@/app/admin/products/actions'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'


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
    variants?: any[]
}

export function ProductForm({ product, categories, variants = [] }: ProductFormProps) {
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

    // New Variant Management
    const [isAddVariantOpen, setIsAddVariantOpen] = useState(false)
    const [newVariantColor, setNewVariantColor] = useState('')
    const [newVariantImage, setNewVariantImage] = useState<string[]>([])
    const [creatingVariant, setCreatingVariant] = useState(false)
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)

    const handleGenerateDescription = async () => {
        const nameInput = document.getElementById('name') as HTMLInputElement
        const categorySelect = document.getElementsByName('category_id')[0] as HTMLSelectElement
        const name = nameInput?.value
        const categoryId = categorySelect?.value
        const categoryName = categories.find(c => c.id === categoryId)?.name || 'Event Rental'

        if (!name) {
            toast.error("Please enter a product name first")
            return
        }

        // Check if authenticated with Puter
        const signedIn = await aiService.isSignedIn()
        if (!signedIn) {
            const user = await aiService.signIn()
            if (!user) {
                toast.error("Please sign in with Puter to use AI features.")
                return
            }
        }

        setIsGeneratingDescription(true)
        try {
            const description = await aiService.generateProductDescription(name, categoryName)
            if (description) {
                const descTextarea = document.getElementById('description') as HTMLTextAreaElement
                if (descTextarea) {
                    descTextarea.value = description
                }
                toast.success("Premium description generated!")
            }
        } catch (error) {
            toast.error("Failed to generate description")
        } finally {
            setIsGeneratingDescription(false)
        }
    }

    const handleCreateVariant = async () => {
        if (!newVariantColor) {
            toast.error("Please enter a color name")
            return
        }

        setCreatingVariant(true)
        try {
            const result = await createProductVariant(
                product,
                newVariantColor,
                newVariantImage[0] || null
            )

            if (result.success) {
                toast.success(`Created ${newVariantColor} variant!`)
                setIsAddVariantOpen(false)
                setNewVariantColor('')
                setNewVariantImage([])
                // Optional: router.push to the new variant or just stay here and see it appear in the list (refresh happens in server action)
            }
        } catch (error) {
            toast.error("Failed to create variant")
            console.error(error)
        } finally {
            setCreatingVariant(false)
        }
    }

    // Link Existing Variant State
    const [openLinkSearch, setOpenLinkSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    const searchProducts = async (query: string) => {
        setSearchQuery(query)
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
                .neq('id', product?.id || 'new')
                .limit(5)

            if (error) throw error
            setSearchResults(data || [])
        } catch (error) {
            console.error('Error searching products:', error)
        } finally {
            setSearching(false)
        }
    }

    const handleLinkProduct = async (targetProduct: any) => {
        try {
            await linkProductVariant(product.id, targetProduct.id);
            toast.success(`Linked ${targetProduct.name} to this group`)
            setOpenLinkSearch(false)
        } catch (error) {
            toast.error("Failed to link product")
        }
    }

    const handleUnlinkProduct = async (e: React.MouseEvent, variantId: string) => {
        e.stopPropagation()
        if (!confirm("Unlink this product from the group? It will become a standalone product.")) return;

        try {
            await unlinkProductVariant(variantId);
            toast.success("Product unlinked")
        } catch (error) {
            toast.error("Failed to unlink")
        }
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
            cost: Math.round(parseFloat(formData.get('cost') as string || '0') * 100),
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

                    <Input
                        id="slug"
                        name="slug"
                        type="hidden"
                        defaultValue={product?.slug}
                        onChange={(e) => {
                            e.target.dataset.auto = 'false'
                        }}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base">Color Variants</Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Manage different colors of this product. Each color is a separate product linked by a Group ID.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAddVariantOpen(true)}
                                    disabled={!product?.id} // Can only add variants to existing saved products
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Color
                                </Button>
                            </div>

                            {!product?.id && (
                                <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-md text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Save this product first to add color variants.
                                </div>
                            )}

                            {product?.id && (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => setIsAddVariantOpen(true)}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create New Variant
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => setOpenLinkSearch(true)}
                                        >
                                            <LinkIcon className="mr-2 h-4 w-4" />
                                            Link Existing Product
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {/* Current Product Card */}
                                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex flex-col gap-3 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl-md font-medium uppercase">
                                                Current
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-background rounded overflow-hidden flex-shrink-0">
                                                    {mainImage[0] && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={mainImage[0]} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">Editing this one</p>
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-primary/10">
                                                <Label htmlFor="color" className="text-xs">Color Name</Label>
                                                <Input
                                                    id="color"
                                                    name="color"
                                                    defaultValue={product.color}
                                                    placeholder="e.g. Gold"
                                                    className="h-8 text-xs mt-1 bg-white dark:bg-black/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Sibling Variants */}
                                        {variants.filter(v => v.id !== product.id).map(variant => (
                                            <div
                                                key={variant.id}
                                                className="p-3 bg-muted/30 border border-border rounded-lg flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer group relative"
                                                onClick={() => router.push(`/admin/products/${variant.id}`)}
                                            >
                                                <div className="h-10 w-10 bg-background rounded overflow-hidden flex-shrink-0">
                                                    {variant.image_url && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={variant.image_url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium truncate text-muted-foreground group-hover:text-foreground transition-colors">
                                                            {variant.color || 'No Color'}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate opacity-70">{variant.name}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => handleUnlinkProduct(e, variant.id)}
                                                    title="Unlink from group"
                                                >
                                                    <Unlink className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Link Existing Dialog */}
                        <CommandDialog
                            open={openLinkSearch}
                            onOpenChange={setOpenLinkSearch}
                            commandProps={{ shouldFilter: false }}
                        >
                            <CommandInput
                                placeholder="Search product to link..."
                                value={searchQuery}
                                onValueChange={searchProducts}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {searching ? 'Searching...' : 'No products found.'}
                                </CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    {searchResults.map((result) => (
                                        <CommandItem
                                            key={result.id}
                                            value={result.id}
                                            onSelect={() => handleLinkProduct(result)}
                                            className="group flex items-center gap-4 p-3 cursor-pointer aria-selected:bg-neutral-50 aria-selected:text-foreground border-b last:border-0 border-border/50 transition-colors relative"
                                        >
                                            <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0 relative border border-border shadow-sm">
                                                {result.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={result.image_url} alt={result.name} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full bg-secondary text-[9px] flex items-center justify-center text-muted-foreground">No Img</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-medium truncate">{result.name}</span>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{result.color || 'No Color'}</span>
                                                    {result.group_id && <span className="text-amber-600 bg-amber-500/10 px-1 rounded text-[10px] uppercase font-bold">In Group</span>}
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-bold uppercase text-muted-foreground group-aria-selected:text-primary opacity-0 group-aria-selected:opacity-100">
                                                Link
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </CommandDialog>

                        {/* Add Variant Dialog */}
                        <Dialog open={isAddVariantOpen} onOpenChange={setIsAddVariantOpen}>
                            <DialogContent className="sm:max-w-[425px] bg-[#17171a] border-[var(--dashboard-border)]">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-serif">Add Color Variant</DialogTitle>
                                    <DialogDescription>
                                        Create a new version of this product in a different color.
                                        Details like category and price will be copied.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="variant-color">New Color Name</Label>
                                        <Input
                                            id="variant-color"
                                            value={newVariantColor}
                                            onChange={(e) => setNewVariantColor(e.target.value)}
                                            placeholder="e.g. Silver, Rose Gold"
                                            className=""
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Variant Image (Optional)</Label>
                                        <div className="h-32">
                                            <ImageUpload
                                                value={newVariantImage}
                                                onChange={setNewVariantImage}
                                                multiple={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddVariantOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateVariant} disabled={creatingVariant || !newVariantColor}>
                                        {creatingVariant ? 'Creating...' : 'Create Variant'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="description">Description</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleGenerateDescription}
                                disabled={isGeneratingDescription}
                                className="text-[var(--dashboard-accent-gold)] hover:text-gold hover:bg-gold/10"
                            >
                                {isGeneratingDescription ? (
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="h-3 w-3 mr-2" />
                                )}
                                AI Generate
                            </Button>
                        </div>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={product?.description}
                            placeholder="Describe the product..."
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Rental Price ($)</Label>
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
                            <Label htmlFor="cost">Cost to Buy ($)</Label>
                            <Input
                                id="cost"
                                name="cost"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={product?.cost ? (product.cost / 100).toFixed(2) : ''}
                                placeholder="0.00"
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
