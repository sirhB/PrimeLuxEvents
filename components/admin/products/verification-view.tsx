'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Check, Edit2, Package, DollarSign, Archive, Image as ImageIcon, Search, ChevronRight } from 'lucide-react'
import { updateAndVerifyProduct } from '@/app/admin/products/actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface VerificationViewProps {
    products: any[]
    categories: any[]
}

export function VerificationView({ products: initialProducts, categories }: VerificationViewProps) {
    const [products, setProducts] = useState(initialProducts)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isVerifying, setIsVerifying] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const currentProduct = products[currentIndex]

    // Form state for inline editing
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        cost: '',
        stock: '',
        category_id: ''
    })

    useEffect(() => {
        if (currentProduct) {
            setFormData({
                name: currentProduct.name || '',
                description: currentProduct.description || '',
                price: currentProduct.price ? (currentProduct.price / 100).toFixed(2) : '',
                cost: currentProduct.cost ? (currentProduct.cost / 100).toFixed(2) : '',
                stock: currentProduct.stock?.toString() || '0',
                category_id: currentProduct.category_id || ''
            })
        }
    }, [currentProduct])

    const handleVerify = async () => {
        if (!currentProduct || isVerifying) return

        setIsVerifying(true)
        try {
            const data = {
                name: formData.name,
                description: formData.description,
                price: Math.round(parseFloat(formData.price || '0') * 100),
                cost: Math.round(parseFloat(formData.cost || '0') * 100),
                stock: parseInt(formData.stock || '0'),
                category_id: formData.category_id || null
            }
            await updateAndVerifyProduct(currentProduct.id, data)
            toast.success(`Verified: ${formData.name}`)

            // Remove verified product from list
            const updatedProducts = products.filter(p => p.id !== currentProduct.id)
            setProducts(updatedProducts)

            // Adjust index
            if (updatedProducts.length > 0) {
                const newIndex = currentIndex >= updatedProducts.length ? updatedProducts.length - 1 : currentIndex
                setCurrentIndex(newIndex)
            }
        } catch (error) {
            toast.error("Failed to verify product")
        } finally {
            setIsVerifying(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (products.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center glass-card p-12 rounded-3xl border-none animate-fade-in my-12">
                <div className="h-20 w-20 rounded-full bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center mb-6">
                    <span className="text-4xl">✨</span>
                </div>
                <h2 className="text-2xl font-serif text-[var(--dashboard-text)] mb-2">Queue Clear!</h2>
                <p className="text-[var(--dashboard-text-muted)] max-w-sm text-center mb-8">
                    You've successfully verified all products in this batch.
                </p>
                <Button asChild className="rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium px-8">
                    <Link href="/admin/products">Return to Inventory</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-8">
            {/* Sidebar List */}
            <div className="w-80 flex flex-col gap-4 border-r border-white/5 pr-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)]" />
                    <Input
                        placeholder="Search queue..."
                        className="pl-10 rounded-full bg-white/5 border-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-2">
                        {filteredProducts.map((product, index) => {
                            const actualIndex = products.findIndex(p => p.id === product.id)
                            const isActive = actualIndex === currentIndex

                            return (
                                <button
                                    key={product.id}
                                    onClick={() => setCurrentIndex(actualIndex)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left",
                                        isActive
                                            ? "bg-[var(--dashboard-accent-gold)] text-black"
                                            : "hover:bg-white/5 text-[var(--dashboard-text-muted)]"
                                    )}
                                >
                                    <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-black/20">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-20">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-xs font-medium truncate", isActive ? "text-black" : "text-[var(--dashboard-text)]")}>
                                            {product.name}
                                        </p>
                                        <p className={cn("text-[10px] uppercase tracking-wider opacity-60 font-bold", isActive ? "text-black/70" : "text-[var(--dashboard-text-muted)]")}>
                                            {product.categories?.name || 'Uncategorized'}
                                        </p>
                                    </div>
                                    {isActive && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                                </button>
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content Detail/Editor */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentProduct.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="h-full flex flex-col gap-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-hidden">
                            {/* Visual Side */}
                            <div className="space-y-6 flex flex-col min-h-0">
                                <div className="glass-card flex-1 min-h-0 rounded-3xl overflow-hidden border-none relative group">
                                    {currentProduct.image_url ? (
                                        <img
                                            src={currentProduct.image_url}
                                            alt={currentProduct.name}
                                            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-black/20 flex flex-col items-center justify-center text-[var(--dashboard-text-muted)] gap-4">
                                            <ImageIcon className="h-16 w-16 opacity-20" />
                                            <p className="font-serif italic">No image provided</p>
                                        </div>
                                    )}

                                    <div className="absolute top-6 left-6 flex gap-2">
                                        <Badge className="bg-black/40 backdrop-blur-md text-white border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            {currentProduct.id.slice(0, 8)}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Gallery Tooltip / Mini-list */}
                                {currentProduct.images && currentProduct.images.length > 0 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                        {currentProduct.images.map((img: string, i: number) => (
                                            <div key={i} className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden glass-card border-none">
                                                <img src={img} alt="" className="w-full h-full object-cover opacity-80" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Editing Side */}
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-6 pb-20">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[var(--dashboard-text-muted)] text-[10px] uppercase font-bold tracking-widest">Product Name</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className="text-xl font-serif bg-transparent border-none p-0 focus-visible:ring-0 placeholder:opacity-20"
                                                placeholder="Enter product name..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[var(--dashboard-text-muted)] text-[10px] uppercase font-bold tracking-widest">Description</Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                className="min-h-[120px] bg-white/5 border-none rounded-2xl resize-none focus-visible:ring-1 focus-visible:ring-[var(--dashboard-accent-gold)]/30 text-sm leading-relaxed"
                                                placeholder="No description provided..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[var(--dashboard-text-muted)] text-[10px] uppercase font-bold tracking-widest">Category</Label>
                                            <Select
                                                value={formData.category_id}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                                            >
                                                <SelectTrigger className="w-full bg-white/5 border-none rounded-xl h-12 text-sm">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white rounded-xl">
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id} className="focus:bg-[var(--dashboard-accent-gold)] focus:text-black">
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[var(--dashboard-text-muted)] text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                                    <DollarSign className="h-3 w-3" /> Rental Price
                                                </Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                                                    <Input
                                                        value={formData.price}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                                        className="pl-8 bg-white/5 border-none rounded-xl"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[var(--dashboard-text-muted)] text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                                    <DollarSign className="h-3 w-3" /> Cost to Buy
                                                </Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                                                    <Input
                                                        value={formData.cost}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                                                        className="pl-8 bg-white/5 border-none rounded-xl"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[var(--dashboard-text-muted)] text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                                                    <Archive className="h-3 w-3" /> Stock Inventory
                                                </Label>
                                                <Input
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                                                    type="number"
                                                    className="bg-white/5 border-none rounded-xl"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                        <Button
                                            onClick={handleVerify}
                                            disabled={isVerifying}
                                            className="flex-1 h-16 rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-bold text-lg shadow-lg shadow-[var(--dashboard-accent-gold)]/10"
                                        >
                                            {isVerifying ? (
                                                "Saving..."
                                            ) : (
                                                <>
                                                    <Check className="mr-2 h-6 w-6" />
                                                    Confirm & Verify
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
