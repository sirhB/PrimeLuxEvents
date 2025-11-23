'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Zap, Clock } from 'lucide-react'

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
        <div className="group relative w-full">
            {/* Animated Border Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gold via-yellow-400 to-gold rounded-2xl opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition-all duration-500 animate-pulse" />

            <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-gold/50 shadow-2xl">
                {/* Deal Badge - Top Corner */}
                <div className="absolute top-0 right-0 z-10">
                    <div className="relative">
                        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white px-6 py-3 rounded-bl-2xl rounded-tr-2xl shadow-lg">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 animate-pulse" />
                                <span className="font-bold text-sm tracking-wide">{dealBadge}</span>
                            </div>
                        </div>
                        {/* Corner accent */}
                        <div className="absolute -bottom-2 right-0 w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-red-800" />
                    </div>
                </div>

                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center">
                            <span className="text-neutral-600 text-lg">No Image</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Sparkle Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold rounded-full animate-ping" />
                        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping delay-100" />
                        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-gold rounded-full animate-ping delay-200" />
                    </div>

                    {/* Limited Time Indicator */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md text-gold px-3 py-2 rounded-full border border-gold/30">
                        <Clock className="h-3.5 w-3.5 animate-pulse" />
                        <span className="text-xs font-semibold">Limited Time</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 bg-gradient-to-b from-card to-card/80">
                    <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-gold transition-colors duration-300">
                        {name}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {description || "Exclusive deal - don't miss out!"}
                    </p>

                    {/* Price with emphasis */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                                {formatCurrency(price)}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground line-through">
                                {formatCurrency(price * 1.3)}
                            </div>
                            <div className="text-sm font-semibold text-green-500">
                                Save {Math.round(((price * 1.3 - price) / (price * 1.3)) * 100)}%
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                        onClick={onViewDetails}
                        className="w-full bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-500 hover:to-gold text-black font-bold py-6 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        Claim This Deal →
                    </Button>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
            </div>
        </div>
    )
}
