'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronRight, Edit2, Package, DollarSign, List, Archive, Image as ImageIcon } from 'lucide-react'
import { verifyProduct } from '@/app/admin/products/actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface VerificationViewProps {
    products: any[]
}

export function VerificationView({ products: initialProducts }: VerificationViewProps) {
    const [products, setProducts] = useState(initialProducts)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isVerifying, setIsVerifying] = useState(false)

    const currentProduct = products[currentIndex]

    const handleVerify = async () => {
        if (!currentProduct || isVerifying) return

        setIsVerifying(true)
        try {
            await verifyProduct(currentProduct.id)
            toast.success(`Verified: ${currentProduct.name}`)

            // Move to next product or finish
            if (currentIndex < products.length - 1) {
                // If we have more in the current list, just slide to next
                setCurrentIndex(currentIndex + 1)
            } else {
                // We've reached the end of this batch
                setProducts([])
            }
        } catch (error) {
            toast.error("Failed to verify product")
        } finally {
            setIsVerifying(false)
        }
    }

    const handleSkip = () => {
        if (currentIndex < products.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            setCurrentIndex(0) // Loop back for now, or could show "end of list"
        }
    }

    if (!currentProduct) return null

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentProduct.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Image Section */}
                        <div className="space-y-4">
                            <div className="glass-card aspect-square rounded-3xl overflow-hidden border-none shadow-2xl relative group">
                                {currentProduct.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={currentProduct.image_url}
                                        alt={currentProduct.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-black/20 flex flex-col items-center justify-center text-[var(--dashboard-text-muted)] gap-4">
                                        <ImageIcon className="h-16 w-16 opacity-20" />
                                        <p className="font-serif italic">No image provided</p>
                                    </div>
                                )}

                                <div className="absolute bottom-6 left-6 flex gap-2">
                                    <Badge className="bg-black/60 backdrop-blur-md text-white border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        {currentProduct.categories?.name || 'Uncategorized'}
                                    </Badge>
                                    {currentProduct.is_featured && (
                                        <Badge className="bg-[var(--dashboard-accent-gold)] text-black border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Preview */}
                            {currentProduct.images && currentProduct.images.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                    {currentProduct.images.map((img: string, i: number) => (
                                        <div key={i} className="h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden glass-card border-none">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt="" className="w-full h-full object-cover opacity-80" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            <div className="glass-card p-8 rounded-3xl border-none space-y-6">
                                <div>
                                    <h2 className="text-4xl font-serif text-[var(--dashboard-text)] mb-4">{currentProduct.name}</h2>
                                    <p className="text-[var(--dashboard-text-muted)] leading-relaxed font-light whitespace-pre-wrap">
                                        {currentProduct.description || "No description provided for this product."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-card bg-black/20 p-4 rounded-2xl border-none">
                                        <div className="flex items-center gap-2 text-[var(--dashboard-text-muted)] mb-1">
                                            <DollarSign className="h-3 w-3" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Price</span>
                                        </div>
                                        <p className="text-xl font-serif text-[var(--dashboard-accent-gold)]">
                                            ${(currentProduct.price / 100).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="glass-card bg-black/20 p-4 rounded-2xl border-none">
                                        <div className="flex items-center gap-2 text-[var(--dashboard-text-muted)] mb-1">
                                            <Archive className="h-3 w-3" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Stock</span>
                                        </div>
                                        <p className="text-xl font-serif text-[var(--dashboard-text)]">
                                            {currentProduct.stock || 0} units
                                        </p>
                                    </div>
                                </div>

                                {currentProduct.assembly_items && currentProduct.assembly_items.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--dashboard-text-muted)]">Assembly Items</span>
                                        <div className="flex flex-wrap gap-2">
                                            {currentProduct.assembly_items.map((item: any, i: number) => (
                                                <Badge key={i} variant="outline" className="rounded-lg py-1 border-white/10 text-white/70">
                                                    {typeof item === 'string' ? item : `${item.name} (x${item.quantity})`}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                    className="flex-1 h-14 rounded-full bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-bold text-lg"
                                >
                                    {isVerifying ? (
                                        "Verifying..."
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-5 w-5" />
                                            Verify & Next
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSkip}
                                    className="h-14 rounded-full border-white/10 hover:bg-white/5 text-white/50 px-8"
                                >
                                    Skip
                                </Button>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="h-14 w-14 rounded-full hover:bg-white/5 text-white/30 p-0"
                                >
                                    <Link href={`/admin/products/${currentProduct.id}`} target="_blank">
                                        <Edit2 className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination / Progress Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card px-6 py-3 rounded-full border-white/10 backdrop-blur-xl flex items-center gap-6 shadow-2xl">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-[var(--dashboard-text-muted)]">
                        Progress
                    </span>
                    <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--dashboard-accent-gold)] transition-all duration-500"
                            style={{ width: `${((currentIndex + 1) / products.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium text-[var(--dashboard-text)]">
                        {currentIndex + 1} / {products.length}
                    </span>
                </div>
            </div>
        </div>
    )
}
