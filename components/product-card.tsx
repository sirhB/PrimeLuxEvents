'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency, cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eye, Heart, ShoppingCart } from 'lucide-react'
import { ProductQuickView } from '@/components/product-quick-view'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: string | null
    categories?: { name: string } | null
    rental_price_daily?: number
    images?: string[]
    quantity_available?: number
    features?: string[]
    slug?: string
}

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const price = product.rental_price_daily || product.price

    return (
        <>
            <motion.div
                className="group relative flex flex-col h-full bg-white overflow-hidden rounded-2xl border border-border/10 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#FDFBF7] rounded-t-2xl">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-6 transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 text-neutral-300">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 opacity-30">
                                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2l5 4H7l5-4z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium tracking-widest uppercase">No Image</span>
                            </div>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-10 w-10 rounded-full bg-white/90 hover:bg-gold hover:text-black backdrop-blur-md shadow-lg transition-all duration-300"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsQuickViewOpen(true)
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="secondary"
                            className={cn(
                                "h-10 w-10 rounded-full backdrop-blur-md shadow-lg transition-all duration-300",
                                isWishlisted
                                    ? "bg-red-500 text-white hover:bg-red-600"
                                    : "bg-white/90 hover:bg-gold hover:text-black"
                            )}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsWishlisted(!isWishlisted)
                            }}
                        >
                            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                        </Button>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-white/90 text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-full backdrop-blur-md shadow-sm border border-border/10">
                            {product.categories?.name || 'Collection'}
                        </span>
                    </div>

                    {/* Quick View Button (Bottom) */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <Button
                            className="w-full bg-white/95 hover:bg-gold text-black font-semibold py-6 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsQuickViewOpen(true)
                            }}
                        >
                            Quick View
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4 p-6 flex-grow">
                    <div className="space-y-2">
                        <Link href={`/catalog/${product.slug || product.id}`} className="block">
                            <h3 className="font-serif text-xl font-light text-foreground hover:text-gold transition-colors duration-300 line-clamp-1 tracking-tight">
                                {product.name}
                            </h3>
                        </Link>
                        {product.description && (
                            <p className="text-sm text-muted-foreground/70 line-clamp-2 font-light leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/5">
                        <div className="flex flex-col">
                            <span className="text-2xl font-light text-foreground">
                                {formatCurrency(price)}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">per day</span>
                        </div>
                        <Link href={`/catalog/${product.slug || product.id}`}>
                            <Button variant="ghost" size="sm" className="rounded-full px-0 hover:bg-transparent text-gold hover:text-gold/80 font-semibold group/btn">
                                Details
                                <motion.span
                                    className="ml-2"
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    →
                                </motion.span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Quick View Modal */}
            <ProductQuickView
                product={product}
                open={isQuickViewOpen}
                onOpenChange={setIsQuickViewOpen}
            />
        </>
    )
}
