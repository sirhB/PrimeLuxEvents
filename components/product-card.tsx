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
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-4 rounded-sm">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                        No Image
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>

            <div className="flex flex-col gap-2 flex-grow">
                <h3 className="font-serif text-lg font-medium group-hover:text-gold transition-colors line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.categories?.name || 'Uncategorized'}
                </p>
                <div className="flex items-baseline gap-2 mt-auto pt-2">
                    <span className="text-xl font-semibold text-gold">
                        {formatCurrency(price)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ day</span>
                </div>
            </div>
        </Link>
    )
}
