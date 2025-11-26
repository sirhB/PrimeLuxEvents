'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'

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

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const price = product.rental_price_daily || product.price

    return (
        <Link
            href={`/catalog/${product.id}`}
            className="group block h-full"
        >
            <motion.div
                className="relative flex flex-col h-full bg-card overflow-hidden rounded-sm border border-transparent hover:border-gold/20 transition-colors duration-300"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
            >
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                            No Image
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                    {/* Quick View / Action Overlay (Optional Future Enhancement) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="w-full py-2 bg-white/90 backdrop-blur-sm text-center text-xs font-medium uppercase tracking-widest text-black">
                            View Details
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 p-4 flex-grow">
                    <div className="space-y-1">
                        <p className="text-xs text-gold font-medium uppercase tracking-widest">
                            {product.categories?.name || 'Collection'}
                        </p>
                        <h3 className="font-serif text-xl font-medium group-hover:text-gold transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                    </div>

                    <div className="mt-auto pt-2 flex items-baseline gap-2 border-t border-border/40">
                        <span className="text-lg font-semibold text-foreground">
                            {formatCurrency(price)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ day</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
