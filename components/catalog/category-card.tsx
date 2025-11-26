'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface CategoryCardProps {
    name: string
    imageUrl?: string | null
    isSelected?: boolean
    onClick: () => void
}

export function CategoryCard({ name, imageUrl, isSelected, onClick }: CategoryCardProps) {
    return (
        <motion.button
            onClick={onClick}
            className={cn(
                "relative group overflow-hidden rounded-sm aspect-[4/3] w-full text-left border border-transparent transition-all duration-300",
                isSelected ? "border-gold ring-1 ring-gold" : "hover:border-gold/30"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />

            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
            ) : (
                <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                    <span className="text-neutral-700">No Image</span>
                </div>
            )}

            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                <h3 className={cn(
                    "text-xl md:text-2xl font-serif font-medium text-white transition-transform duration-300",
                    isSelected ? "translate-y-0 text-gold" : "translate-y-2 group-hover:translate-y-0 group-hover:text-gold"
                )}>
                    {name}
                </h3>
                <div className={cn(
                    "h-0.5 bg-gold mt-2 transition-all duration-500 ease-out",
                    isSelected ? "w-full" : "w-0 group-hover:w-full"
                )} />
            </div>
        </motion.button>
    )
}
