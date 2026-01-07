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
                className="group relative flex flex-col h-full bg-card overflow-hidden rounded-lg border border-transparent hover:border-gold/20 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-gold/5"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
            >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary rounded-t-lg">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400 rounded-t-lg">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2l5 4H7l5-4z" />
                                    </svg>
                                </div>
                                <span className="text-sm">No Image</span>
                            </div>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-sm"
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
                                "h-8 w-8 rounded-full backdrop-blur-sm shadow-sm transition-colors",
                                isWishlisted
                                    ? "bg-red-500/90 hover:bg-red-500 text-white"
                                    : "bg-white/90 hover:bg-white"
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
                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-gold/90 text-black text-xs font-medium rounded-full backdrop-blur-sm">
                            {product.categories?.name || 'Collection'}
                        </span>
                    </div>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            className="bg-white/95 hover:bg-white text-black font-medium px-6 py-2 rounded-full shadow-lg backdrop-blur-sm"
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
                <div className="flex flex-col gap-3 p-5 flex-grow">
                    <div className="space-y-2">
                        <Link href={`/catalog/${product.slug || product.id}`} className="block group/link">
                            <h3 className="font-serif text-lg font-medium group-hover/link:text-gold transition-colors line-clamp-2 leading-tight">
                                {product.name}
                            </h3>
                        </Link>
                        {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {product.description}
                            </p>
                        )}
                    </div>

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/40">
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold text-foreground">
                                {formatCurrency(price)}
                            </span>
                            <span className="text-xs text-muted-foreground -mt-1">per day</span>
                        </div>
                        <Link href={`/catalog/${product.slug || product.id}`}>
                            <Button size="sm" className="rounded-full px-4 bg-gold hover:bg-gold/90 text-black font-medium">
                                View Details
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
