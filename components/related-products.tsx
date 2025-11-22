"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"

interface Product {
    id: string
    name: string
    description: string
    price: number
    rental_price_daily?: number
    image_url: string
    category_id: string
    categories?: { name: string }
    quantity_available?: number
    features?: string[]
}

interface RelatedProductsProps {
    currentProduct: Product
    allProducts: Product[]
    onAddToCart?: (productId: string) => void
    isInCart?: (productId: string) => boolean
    maxItems?: number
    className?: string
}

export function RelatedProducts({
    currentProduct,
    allProducts,
    onAddToCart,
    isInCart,
    maxItems = 4,
    className
}: RelatedProductsProps) {
    // Calculate related products based on category and features
    const relatedProducts = useMemo(() => {
        const scored = allProducts
            .filter(p => p.id !== currentProduct.id) // Exclude current product
            .map(product => {
                let score = 0

                // Same category gets high score
                if (product.category_id === currentProduct.category_id) {
                    score += 10
                }

                // Shared features increase score
                if (currentProduct.features && product.features) {
                    const sharedFeatures = currentProduct.features.filter(f =>
                        product.features?.includes(f)
                    )
                    score += sharedFeatures.length * 2
                }

                // Similar price range
                const currentPrice = currentProduct.rental_price_daily || currentProduct.price
                const productPrice = product.rental_price_daily || product.price
                const priceDiff = Math.abs(currentPrice - productPrice)
                if (priceDiff < currentPrice * 0.3) {
                    score += 3
                }

                return { product, score }
            })
            .filter(item => item.score > 0) // Only include products with some relevance
            .sort((a, b) => b.score - a.score) // Sort by score descending
            .slice(0, maxItems)
            .map(item => item.product)

        return scored
    }, [currentProduct, allProducts, maxItems])

    if (relatedProducts.length === 0) {
        return null
    }

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif">You Might Also Like</h2>
                    <p className="text-sm text-muted-foreground">
                        Complementary items for your event
                    </p>
                </div>
                <Button variant="ghost" asChild>
                    <Link href="/catalog" className="gap-2">
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product, index) => (
                    <div
                        key={product.id}
                        className="group flex flex-col animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-3 rounded-lg">
                            <Link href={`/catalog/${product.id}`}>
                                <Image
                                    src={product.image_url || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </Link>



                            {/* Quick Add Button */}
                            {onAddToCart && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onAddToCart(product.id)
                                    }}
                                    className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-background/95 backdrop-blur flex items-center justify-center shadow-lg hover:bg-background transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                                >
                                    {isInCart?.(product.id) ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Add to quote</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Link href={`/catalog/${product.id}`}>
                                <h3 className="font-serif text-base hover:underline decoration-1 underline-offset-4 line-clamp-2">
                                    {product.name}
                                </h3>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {product.categories?.name || 'Uncategorized'}
                            </p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="font-semibold">
                                    {formatCurrency(product.rental_price_daily || product.price)}
                                </span>
                                <span className="text-xs text-muted-foreground">/ day</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
