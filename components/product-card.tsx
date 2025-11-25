'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: string | null
    categories?: { name: string } | null
    rental_price_daily?: number
}

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const price = product.rental_price_daily || product.price

    return (
        <Link
            href={`/catalog/${product.id}`}
            className="group flex flex-col h-full"
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-2 rounded-lg">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                        No Image
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1 flex-grow">
                <h3 className="font-serif text-base font-medium group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                    {product.categories?.name || 'Uncategorized'}
                </p>
                <div className="flex items-baseline gap-2 mt-auto pt-2">
                    <span className="font-semibold text-gold">
                        {formatCurrency(price)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ day</span>
                </div>
            </div>
        </Link>
    )
}
