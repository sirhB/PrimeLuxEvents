'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface PackageCardProps {
    name: string
    description?: string | null
    price: number
    imageUrl?: string | null
    onViewDetails: () => void
}

export function PackageCard({ name, description, price, imageUrl, onViewDetails }: PackageCardProps) {
    return (
        <div
            className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-gold/50 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
            <div className="aspect-video relative overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                    <p className="text-gold font-semibold text-lg">{formatCurrency(price)}</p>
                </div>
            </div>

            <div className="p-6">
                <p className="text-muted-foreground line-clamp-2 mb-6 text-sm">
                    {description || "No description available."}
                </p>

                <Button
                    onClick={onViewDetails}
                    className="w-full bg-gold/10 text-gold hover:bg-gold hover:text-black transition-colors"
                >
                    View Package Details
                </Button>
            </div>
        </div>
    )
}
