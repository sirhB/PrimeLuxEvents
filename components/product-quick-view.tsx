"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Plus, Check, ExternalLink, Calendar, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Product {
    id: string
    name: string
    description: string
    price: number
    rental_price_daily?: number
    rental_price_weekend?: number
    rental_price_weekly?: number
    image_url: string
    images?: string[]
    category_id: string
    categories?: { name: string }
    quantity_available?: number
    features?: string[]
    sku?: string
    modifiers?: any[]
}

interface ProductQuickViewProps {
    product: Product | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddToCart?: (productId: string) => void
    isInCart?: boolean
}

export function ProductQuickView({
    product,
    open,
    onOpenChange,
    onAddToCart,
    isInCart = false
}: ProductQuickViewProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    if (!product) return null

    const images = product.images && product.images.length > 0
        ? product.images
        : [product.image_url]

    const rentalPrice = product.rental_price_daily || product.price
    const hasWeekendRate = product.rental_price_weekend && product.rental_price_weekend !== rentalPrice
    const hasWeeklyRate = product.rental_price_weekly && product.rental_price_weekly !== rentalPrice



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="sr-only">
                    <h2>Quick View: {product.name}</h2>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-lg">
                            <Image
                                src={images[selectedImageIndex]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Thumbnail Navigation */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.slice(0, 4).map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={cn(
                                            "relative aspect-square bg-secondary overflow-hidden rounded-md transition-all",
                                            selectedImageIndex === index
                                                ? "ring-2 ring-primary"
                                                : "opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${product.name} - ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col gap-4">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {product.sku && (
                                    <Badge variant="outline" className="text-xs uppercase">
                                        {product.sku}
                                    </Badge>
                                )}

                            </div>
                            <h2 className="text-3xl font-serif mb-2">{product.name}</h2>
                            <p className="text-sm text-muted-foreground">
                                {product.categories?.name || 'Uncategorized'}
                            </p>
                        </div>

                        <Separator />

                        {/* Pricing */}
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-semibold">
                                    ${rentalPrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground">/ day</span>
                            </div>

                            {(hasWeekendRate || hasWeeklyRate) && (
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {hasWeekendRate && (
                                        <p>Weekend (2-3 days): ${product.rental_price_weekend?.toFixed(2)}</p>
                                    )}
                                    {hasWeeklyRate && (
                                        <p>Weekly (7+ days): ${product.rental_price_weekly?.toFixed(2)}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Description */}
                        <div>
                            <p className="text-sm text-muted-foreground line-clamp-4">
                                {product.description}
                            </p>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.features.slice(0, 6).map((feature, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                        {feature}
                                    </Badge>
                                ))}
                                {product.features.length > 6 && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{product.features.length - 6} more
                                    </Badge>
                                )}
                            </div>
                        )}

                        <Separator />

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm">

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Min. 1 day rental
                                </span>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto">
                            <Button
                                className="flex-1"
                                onClick={() => onAddToCart?.(product.id)}
                                variant={isInCart ? "outline" : "default"}

                            >
                                {isInCart ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" /> Added to Quote
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" /> Add to Quote
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={`/catalog/${product.id}`}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Full Details
                                </Link>
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            View full details for rental dates, quantity selection, and customization options
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
