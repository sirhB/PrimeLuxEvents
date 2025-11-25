'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useState, useEffect } from 'react'

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
    index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const price = product.rental_price_daily || product.price
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={!isMobile ? { y: -10 } : undefined}
            className="group flex flex-col h-full"
        >
            <Link href={`/catalog/${product.id}`} className="flex flex-col h-full">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-2 rounded-sm">
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

                    {/* Hover overlay - desktop only */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 hidden md:block" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex">
                        <span className="bg-white/90 text-black px-6 py-2 rounded-full text-sm font-medium uppercase tracking-wider backdrop-blur-sm flex items-center gap-2">
                            <Eye className="w-4 h-4" /> View
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1 flex-grow">
                    <h3 className="font-serif text-base font-medium group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {product.categories?.name || 'Uncategorized'}
                    </p>
                    <div className="flex items-baseline gap-2 mt-auto pt-2">
                        <span className="font-semibold text-primary">
                            {formatCurrency(price)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ day</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
