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
    categories?: { name: string, slug?: string } | null
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
    const productUrl = `/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`
    const price = product.rental_price_daily || product.price

    return (
        <Link href={productUrl} className="block h-full">
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
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1.5 bg-white/90 text-black text-[10px] font-bold tracking-[0.2em] uppercase rounded-full backdrop-blur-md shadow-sm border border-border/10">
                        {product.categories?.name || 'Collection'}
                    </span>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4 p-6 flex-grow">
                    <div className="space-y-2">
                        <h3 className="font-serif text-xl font-light text-foreground group-hover:text-gold transition-colors duration-300 line-clamp-1 tracking-tight">
                            {product.name}
                        </h3>
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
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
