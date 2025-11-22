'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface CategoryCardProps {
    name: string
    imageUrl?: string | null
    isSelected?: boolean
    onClick: () => void
}

export function CategoryCard({ name, imageUrl, isSelected, onClick }: CategoryCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative group overflow-hidden rounded-xl aspect-[4/3] w-full text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                isSelected ? "ring-2 ring-gold shadow-lg shadow-gold/20" : "hover:shadow-xl hover:shadow-gold/10"
            )}
        >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10" />

            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                    <span className="text-neutral-700">No Image</span>
                </div>
            )}

            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                <h3 className={cn(
                    "text-2xl font-serif font-bold text-white transition-transform duration-300",
                    isSelected ? "translate-y-0" : "translate-y-2 group-hover:translate-y-0"
                )}>
                    {name}
                </h3>
                <div className={cn(
                    "h-1 bg-gold mt-2 transition-all duration-300",
                    isSelected ? "w-full" : "w-0 group-hover:w-full"
                )} />
            </div>
        </button>
    )
}
