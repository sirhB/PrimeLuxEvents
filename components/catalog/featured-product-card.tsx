'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: string | null
    categories?: { name: string } | null
    rental_price_daily?: number
}

interface FeaturedProductCardProps {
    product: Product
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
    const price = product.rental_price_daily || product.price

    return (
        <Link
            href={`/catalog/${product.id}`}
            className="group relative block w-full"
        >
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary shadow-lg">
                {/* Image */}
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-700">
                        No Image
                    </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Gold Glow Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-gold/20 via-transparent to-gold/10" />

                {/* Featured Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-gold/95 backdrop-blur-sm text-black px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                    <Sparkles className="h-4 w-4" />
                    FEATURED
                </div>

                {/* Category Tag */}
                {product.categories?.name && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20">
                        {product.categories.name}
                    </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="text-white/80 text-sm mb-4 line-clamp-2 max-w-2xl">
                            {product.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gold">
                                {formatCurrency(price)}
                            </span>
                            <span className="text-white/70 text-sm">/ day</span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <div className="bg-gold text-black px-6 py-2 rounded-full font-semibold text-sm shadow-lg">
                                View Details →
                            </div>
                        </div>
                    </div>
                </div>

                {/* Border Glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-gold/50 transition-all duration-500" />
            </div>
        </Link>
    )
}
