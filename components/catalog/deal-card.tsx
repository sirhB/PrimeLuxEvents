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
            <div className="relative h-full overflow-hidden rounded-2xl bg-white border border-border/5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col">

                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#FDFBF7]">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            className="object-cover transition-all duration-1000 ease-out group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-neutral-50 flex items-center justify-center">
                            <span className="text-neutral-300 text-xs font-bold tracking-widest uppercase">No Image</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                    {/* Deal Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gold text-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
                            <Zap className="h-3 w-3 fill-current" />
                            <span className="font-bold text-[10px] tracking-[0.2em] uppercase">{dealBadge}</span>
                        </div>
                    </div>

                    {/* Limited Time Indicator */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/90 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-bold tracking-wider uppercase">Limited Time</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl md:text-3xl font-serif font-light mb-3 text-foreground group-hover:text-gold transition-colors duration-300 tracking-tight">
                        {name}
                    </h3>

                    <p className="text-muted-foreground/70 text-sm mb-8 line-clamp-2 flex-grow font-light leading-relaxed">
                        {description || "Exclusive deal - don't miss out on this premium selection."}
                    </p>

                    <div className="flex items-end justify-between mt-auto pt-6 border-t border-border/5">
                        <div>
                            <div className="text-[10px] text-muted-foreground/50 line-through mb-1 uppercase tracking-widest font-medium">
                                Regular {formatCurrency(price * 1.3)}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-light text-foreground">
                                    {formatCurrency(price)}
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={onViewDetails}
                            className="rounded-full bg-black text-white hover:bg-gold hover:text-black px-8 py-6 transition-all duration-300 font-medium"
                        >
                            View Package
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
