'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: string | null
    categories?: { name: string, slug?: string } | null
    rental_price_daily?: number
    slug?: string
}

interface FeaturedProductCardProps {
    product: Product
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
    const price = product.rental_price_daily || product.price

    return (
        <Link
            href={`/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`}
            className="group relative block w-full h-full"
        >
            <div className="relative h-full aspect-[16/10] md:aspect-[2/1] overflow-hidden rounded-sm bg-secondary border border-transparent transition-all duration-500 hover:border-[var(--champagne,#B8956B)]/30 spotlight-frame">
                {/* Image */}
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-1000 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-700">
                        No Image
                    </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent opacity-60" />

                {/* Featured Badge */}
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-gold text-black px-3 py-1 rounded-sm font-medium text-xs tracking-widest uppercase shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    Featured Collection
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-2xl space-y-4">
                        {product.categories?.name && (
                            <span className="text-gold/80 text-xs font-medium tracking-widest uppercase">
                                {product.categories.name}
                            </span>
                        )}
                        <h3 className="text-3xl md:text-4xl font-serif font-medium text-white group-hover:text-gold transition-colors duration-300">
                            {product.name}
                        </h3>

                        {product.description && (
                            <p className="text-gray-300 text-sm md:text-base line-clamp-2 max-w-xl leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        <div className="flex items-baseline gap-3 pt-2">
                            <span className="text-3xl font-light text-white">
                                {formatCurrency(price)}
                            </span>
                            <span className="text-white/60 text-sm">/ day</span>
                        </div>
                    </div>

                </div>
            </div>
        </Link>
    )
}
