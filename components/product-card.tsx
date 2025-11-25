'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, Eye } from 'lucide-react'

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
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group flex flex-col h-full"
        >
            <Link href={`/catalog/${product.id}`} className="flex flex-col h-full">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-2 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    {product.image_url ? (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full"
                        >
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                            No Image
                        </div>
                    )}

                    {/* Overlay with view details button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
                        >
                            <Eye className="w-5 h-5 text-gray-800" />
                        </motion.div>
                    </motion.div>

                    {/* Subtle shine effect */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    />
                </div>

                <motion.div
                    className="flex flex-col gap-1 flex-grow"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.h3
                        className="font-serif text-base font-medium line-clamp-2 relative"
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.2 }}
                    >
                        {product.name}
                        <motion.div
                            initial={{ width: 0 }}
                            whileHover={{ width: "100%" }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-0 left-0 h-0.5 bg-gold"
                        />
                    </motion.h3>

                    <motion.p
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {product.categories?.name || 'Uncategorized'}
                    </motion.p>

                    <motion.div
                        className="flex items-center justify-between mt-auto pt-2"
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-baseline gap-2">
                            <motion.span
                                className="font-semibold text-gold"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                {formatCurrency(price)}
                            </motion.span>
                            <span className="text-xs text-muted-foreground">/ day</span>
                        </div>

                        <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            whileHover={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-gold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </Link>
        </motion.div>
    )
}
