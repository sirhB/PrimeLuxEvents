"use client"

import { useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    rental_price_daily?: number
    image_url: string | null
    category_id: string | null
    categories?: { name: string } | null
    quantity_available?: number
    features?: string[]
    slug?: string
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
        <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8", className)}>
            {relatedProducts.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </div>
    )
}
