"use client"

import { use, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, Plus, Ruler, Box, Tag } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ModifierOption {
  id: string
  label: string
  priceAdjustment: number
}

interface Modifier {
  id: string
  name: string
  options: ModifierOption[]
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
  stock: number
  modifiers: Modifier[]
  // properties from mock data that might be missing in DB schema yet, handling gracefully
  dimensions?: string
  material?: string
  sku?: string
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption>>({})

  const { items, addItem, removeItem } = useCart()
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Error fetching product:', error)
        setLoading(false)
        return
      }

      setProduct(data)
      setLoading(false)
      setIsLoaded(true)
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>
  }

  if (!product) {
    notFound()
  }

  const isInCart = items.some((item) => item.productId === product.id)

  // Calculate total price
  const modifiersPrice = Object.values(selectedModifiers).reduce((acc, curr) => acc + curr.priceAdjustment, 0)
  const totalPrice = product.price + modifiersPrice

  const toggleCart = () => {
    if (isInCart) {
      removeItem(product.id)
    } else {
      // Note: Cart provider might need update to store selected modifiers
      addItem(product.id)
    }
  }

  const handleModifierChange = (modifierId: string, optionId: string) => {
    const modifier = product.modifiers?.find(m => m.id === modifierId)
    const option = modifier?.options.find(o => o.id === optionId)
    if (modifier && option) {
      setSelectedModifiers(prev => ({
        ...prev,
        [modifierId]: option
      }))
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
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details Section */}
          <div className={`flex flex-col gap-8 ${isLoaded ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
            <div>
              {/* Category fetching omitted for brevity, could fetch if needed */}
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">
                Product
              </p>
              <h1 className="text-4xl md:text-5xl font-serif mb-4">{product.name}</h1>
              <p className="text-2xl font-medium">
                ${totalPrice.toFixed(2)} <span className="text-sm text-muted-foreground font-normal">/ day</span>
              </p>
            </div>

            <div className="prose prose-stone max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            {/* Modifiers Section */}
            {product.modifiers && product.modifiers.length > 0 && (
              <div className="space-y-6 py-6 border-y border-border">
                {product.modifiers.map((modifier) => (
                  <div key={modifier.id} className="space-y-3">
                    <Label className="text-base font-medium">{modifier.name}</Label>
                    <RadioGroup
                      onValueChange={(value: string) => handleModifierChange(modifier.id, value)}
                      value={selectedModifiers[modifier.id]?.id}
                    >
                      <div className="flex flex-wrap gap-3">
                        {modifier.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="cursor-pointer">
                              {option.label}
                              {option.priceAdjustment > 0 && ` (+$${option.priceAdjustment.toFixed(2)})`}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border">
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
      </div>
    </>
  )
}
