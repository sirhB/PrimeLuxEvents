'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
    name: string
    imageUrl?: string | null
    isSelected?: boolean
    onClick: () => void
    productCount?: number
}

export function CategoryCard({ name, imageUrl, isSelected, onClick, productCount }: CategoryCardProps) {
    return (
        <motion.button
            onClick={onClick}
            className={cn(
                "relative group overflow-hidden rounded-xl w-full text-left border border-transparent transition-all duration-500 bg-card hover:shadow-xl hover:shadow-gold/10",
                isSelected ? "border-gold ring-2 ring-gold/20 bg-gold/5 shadow-lg shadow-gold/20" : "hover:border-gold/30"
            )}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-secondary">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                        <div className="text-center text-neutral-500">
                            <div className="w-12 h-12 mx-auto mb-2 opacity-60">
                                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2l5 4H7l5-4z"/>
                                </svg>
                            </div>
                            <span className="text-sm font-medium">No Preview</span>
                        </div>
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300" />

                {/* Product Count Badge */}
                {productCount && (
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                            {productCount} items
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className={cn(
                            "text-lg md:text-xl font-serif font-medium transition-colors duration-300",
                            isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
                        )}>
                            {name}
                        </h3>
                        {productCount && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {productCount} premium {productCount === 1 ? 'item' : 'items'}
                            </p>
                        )}
                    </div>
                    <ArrowRight className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isSelected ? "text-gold translate-x-1" : "text-muted-foreground group-hover:text-gold group-hover:translate-x-1"
                    )} />
                </div>

                {/* Animated Underline */}
                <div className={cn(
                    "h-0.5 bg-gold mt-4 transition-all duration-500 ease-out",
                    isSelected ? "w-full" : "w-0 group-hover:w-full"
                )} />
            </div>
        </motion.button>
    )
}
