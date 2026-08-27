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
    categories?: { name: string, slug?: string } | null
    rental_price_daily?: number
    images?: string[]
    quantity_available?: number
    features?: string[]
    slug?: string
}

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const productUrl = `/catalog/${product.categories?.slug || 'uncategorized'}/${product.slug || product.id}`
    const price = product.rental_price_daily || product.price

    return (
        <Link href={productUrl} className="group block h-full">
            <article className="spotlight-frame flex h-full flex-col overflow-hidden rounded-2xl border border-border/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-[var(--linen,#F7F4EF)]">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 text-neutral-300">
                            <span className="text-xs font-medium uppercase tracking-widest">Image coming soon</span>
                        </div>
                    )}
                </div>

                <div className="absolute left-4 top-4 z-10">
                    <span className="rounded-full border border-border/10 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink,#121110)] shadow-sm backdrop-blur-md">
                        {product.categories?.name || 'Collection'}
                    </span>
                </div>

                <div className="flex flex-grow flex-col gap-4 p-6">
                    <div className="space-y-2">
                        <h3 className="line-clamp-1 font-serif text-xl font-light tracking-tight text-foreground transition-colors duration-300 group-hover:text-[var(--champagne,#B8956B)]">
                            {product.name}
                        </h3>
                        {product.description && (
                            <p className="line-clamp-2 text-sm font-light leading-relaxed text-muted-foreground/70">
                                {product.description}
                            </p>
                        )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border/5 pt-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-light text-foreground">{formatCurrency(price)}</span>
                            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">per day</span>
                        </div>
                        {typeof product.quantity_available === 'number' && (
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--sage,#8A9A8B)]">
                                {product.quantity_available > 0 ? 'Available' : 'Reserved'}
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    )
}
