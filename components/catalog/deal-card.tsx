'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Zap, Clock, ArrowRight } from 'lucide-react'

interface DealCardProps {
    name: string
    description?: string | null
    price: number
    imageUrl?: string | null
    onViewDetails: () => void
    dealBadge?: string // e.g., "20% OFF", "LIMITED TIME", "SPECIAL OFFER"
}

export function DealCard({ name, description, price, imageUrl, onViewDetails, dealBadge = "SPECIAL DEAL" }: DealCardProps) {
    return (
        <div className="group relative w-full h-full">
            <div className="relative h-full overflow-hidden rounded-sm bg-card border border-border/50 hover:border-gold/50 transition-all duration-500 flex flex-col">

                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                            <span className="text-neutral-600">No Image</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Deal Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-red-600 text-white px-3 py-1 rounded-sm shadow-lg flex items-center gap-1.5">
                            <Zap className="h-3 w-3 fill-current" />
                            <span className="font-medium text-xs tracking-wider uppercase">{dealBadge}</span>
                        </div>
                    </div>

                    {/* Limited Time Indicator */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-medium">Limited Time Offer</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow bg-card">
                    <h3 className="text-xl md:text-2xl font-serif font-medium mb-2 group-hover:text-gold transition-colors duration-300">
                        {name}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">
                        {description || "Exclusive deal - don't miss out!"}
                    </p>

                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/40">
                        <div>
                            <div className="text-xs text-muted-foreground line-through mb-1">
                                {formatCurrency(price * 1.3)}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-semibold text-gold">
                                    {formatCurrency(price)}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={onViewDetails}
                            size="sm"
                            className="rounded-full bg-gold text-black hover:bg-gold/90 px-6"
                        >
                            View Deal
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
