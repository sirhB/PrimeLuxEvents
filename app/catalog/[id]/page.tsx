"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, Plus, Ruler, Box, Tag } from "lucide-react"
import { products } from "@/lib/data"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = products.find((p) => p.id === id)
  const { items, addItem, removeItem } = useCart()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!product) {
    notFound()
  }

  const isInCart = items.some((item) => item.productId === product.id)
  const relatedProducts = products.filter((p) => product.relatedIds?.includes(p.id))

  const toggleCart = () => {
    if (isInCart) {
      removeItem(product.id)
    } else {
      addItem(product.id)
    }
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 py-6">
        <Link
          href="/catalog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collection
        </Link>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Section */}
          <div
            className={`relative aspect-[3/4] bg-secondary overflow-hidden rounded-sm ${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details Section */}
          <div className={`flex flex-col gap-8 ${isLoaded ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif mb-4">{product.name}</h1>
              <p className="text-2xl font-medium">
                ${product.price.toFixed(2)} <span className="text-sm text-muted-foreground font-normal">/ day</span>
              </p>
            </div>

            <div className="prose prose-stone max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-border">
              {product.dimensions && (
                <div className="flex items-start gap-3">
                  <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm uppercase tracking-wide">Dimensions</h3>
                    <p className="text-muted-foreground">{product.dimensions}</p>
                  </div>
                </div>
              )}
              {product.material && (
                <div className="flex items-start gap-3">
                  <Box className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm uppercase tracking-wide">Material</h3>
                    <p className="text-muted-foreground">{product.material}</p>
                  </div>
                </div>
              )}
              {product.sku && (
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm uppercase tracking-wide">SKU</h3>
                    <p className="text-muted-foreground">{product.sku}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                className="w-full md:w-auto text-lg h-14 px-8"
                onClick={toggleCart}
                variant={isInCart ? "outline" : "default"}
              >
                {isInCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" /> Added to Quote
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" /> Add to Quote
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center md:text-left">
                *Delivery and setup fees calculated at checkout based on location and logistics.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-serif mb-12">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/catalog/${related.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
                    <Image
                      src={related.image || "/placeholder.svg"}
                      alt={related.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-serif text-lg group-hover:underline decoration-1 underline-offset-4">
                    {related.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">${related.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
