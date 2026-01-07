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
                "relative group overflow-hidden rounded-2xl w-full text-left border border-border/5 transition-all duration-500 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]",
                isSelected ? "border-gold ring-4 ring-gold/10 shadow-xl shadow-gold/5" : "hover:border-gold/20"
            )}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[#FDFBF7]">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-50 flex items-center justify-center">
                        <div className="text-center text-neutral-300">
                            <div className="w-12 h-12 mx-auto mb-2 opacity-30">
                                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2l5 4H7l5-4z" />
                                </svg>
                            </div>
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">No Preview</span>
                        </div>
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

                {/* Product Count Badge */}
                {productCount && (
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1.5 bg-white/90 text-black text-[10px] font-bold tracking-[0.1em] uppercase rounded-full backdrop-blur-md shadow-sm border border-border/10">
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
                            "text-xl md:text-2xl font-serif font-light transition-colors duration-300 tracking-tight",
                            isSelected ? "text-gold" : "text-foreground group-hover:text-gold"
                        )}>
                            {name}
                        </h3>
                        {productCount && (
                            <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-[0.15em] font-medium">
                                {productCount} premium {productCount === 1 ? 'piece' : 'pieces'}
                            </p>
                        )}
                    </div>
                    <div className={cn(
                        "h-10 w-10 rounded-full border border-border/10 flex items-center justify-center transition-all duration-500",
                        isSelected ? "bg-gold border-gold text-black" : "bg-white group-hover:bg-gold group-hover:border-gold group-hover:text-black"
                    )}>
                        <ArrowRight className={cn(
                            "h-4 w-4 transition-transform duration-500",
                            isSelected ? "translate-x-0" : "group-hover:translate-x-0 -translate-x-1"
                        )} />
                    </div>
                </div>

                {/* Animated Underline */}
                <div className={cn(
                    "h-0.5 bg-gold mt-6 transition-all duration-700 ease-out opacity-40",
                    isSelected ? "w-full" : "w-0 group-hover:w-full"
                )} />
            </div>
        </motion.button>
    )
}
