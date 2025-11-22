"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, Plus, Minus, Package, Truck, Calendar as CalendarIcon, Info } from "lucide-react"
import { DateRange } from "react-day-picker"
import { differenceInDays } from "date-fns"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductGallery } from "@/components/product-gallery"
import { RentalDatePicker } from "@/components/rental-date-picker"
import { RelatedProducts } from "@/components/related-products"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  rental_price_daily?: number
  rental_price_weekend?: number
  rental_price_weekly?: number
  image_url: string
  images?: string[]
  category_id: string
  stock: number
  quantity_available?: number
  minimum_rental_days?: number
  setup_fee?: number
  modifiers: Modifier[]
  features?: string[]
  care_instructions?: string
  sku?: string
  weight?: number
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption>>({})
  const [quantity, setQuantity] = useState(1)


  const { items, addItem, removeItem, updateQuantity: updateCartQuantity } = useCart()
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

      // Fetch all products for related products
      const { data: allProductsData } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false })

      if (allProductsData) {
        setAllProducts(allProductsData)
      }

      setLoading(false)
      setIsLoaded(true)
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/4 mx-auto"></div>
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const cartItem = items.find((item) => item.productId === product.id)
  const isInCart = !!cartItem
  const isInCartFn = (productId: string) => items.some((item) => item.productId === productId)
  const maxQuantity = 100

  const basePrice = product.rental_price_daily || product.price
  const modifiersPrice = Object.values(selectedModifiers).reduce((acc, curr) => acc + curr.priceAdjustment, 0)
  const setupFee = product.setup_fee || 0
  const subtotal = (basePrice + modifiersPrice) * quantity
  const totalPrice = subtotal + setupFee

  const toggleCart = () => {
    if (isInCart) {
      removeItem(product.id)
    } else {
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



  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(q => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1)
    }
  }

  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.image_url]

  const canAddToCart = true

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/10">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 py-6">
        <Link
          href="/catalog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Gallery */}
          <div className={`${isLoaded ? "animate-fade-in-up" : "opacity-0"}`}>
            <ProductGallery images={galleryImages} productName={product.name} />
          </div>

          {/* Details Section */}
          <div className={`flex flex-col gap-6 ${isLoaded ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs uppercase">
                  {product.sku || 'Product'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold">
                  ${basePrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">/ day for {product.name}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="prose prose-stone max-w-none">
            <p className="text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.features.map((feature, idx) => (
                <Badge key={idx} variant="secondary">
                  {feature}
                </Badge>
              ))}
            </div>
          )}

          <Separator />



          {/* Quantity Selector */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val) && val >= 1 && val <= maxQuantity) {
                    setQuantity(val)
                  } else if (e.target.value === '') {
                    // Allow empty string for typing, but handle blur or submit to default to 1
                    // For now, let's just not update if invalid, or maybe handle it better.
                    // A simple approach is to only update if valid number.
                  }
                }}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>

            </div>
          </div>

          {/* Modifiers Section */}
          {product.modifiers && product.modifiers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-base font-medium">Customize Your Rental</Label>
                {product.modifiers.map((modifier) => (
                  <div key={modifier.id} className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {modifier.name}
                    </Label>
                    <RadioGroup
                      onValueChange={(value: string) => handleModifierChange(modifier.id, value)}
                      value={selectedModifiers[modifier.id]?.id}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {modifier.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-secondary/50 transition-colors"
                          >
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="cursor-pointer flex-1">
                              <span className="font-medium">{option.label}</span>
                              {option.priceAdjustment > 0 && (
                                <span className="text-muted-foreground ml-2">
                                  +${option.priceAdjustment.toFixed(2)}
                                </span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator />

          {/* Add to Cart */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full text-lg h-14 shadow-lg hover:shadow-xl transition-all"
              onClick={() => {
                if (isInCart) {
                  if (cartItem?.quantity !== quantity) {
                    updateCartQuantity(product.id, quantity)
                  } else {
                    // Maybe remove if they click "Added to Quote"? Or do nothing?
                    // User said "update the button to be able to save cart changes"
                    // If it's already saved, maybe just do nothing or show a toast?
                    // Let's assume clicking "Added to Quote" does nothing or toggles off if they really want to remove.
                    // But standard UX is usually "Remove" button or toggle.
                    // Given the previous code was toggle, let's keep toggle functionality if quantity matches?
                    // Or maybe better: if quantity matches, it says "Added to Quote" and is disabled or acts as remove?
                    // Let's make it:
                    // If quantity changed: "Update Quote"
                    // If quantity same: "Added to Quote" (click to remove?)
                    removeItem(product.id)
                  }
                } else {
                  addItem(product.id, quantity)
                }
              }}
              variant={isInCart && cartItem?.quantity === quantity ? "outline" : "default"}
              disabled={!canAddToCart}
            >
              {isInCart ? (
                cartItem?.quantity !== quantity ? (
                  <>
                    <Package className="mr-2 h-5 w-5" /> Update Quote
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" /> Added to Quote
                  </>
                )
              ) : (
                <>
                  <Plus className="mr-2 h-5 w-5" /> Add to Quote
                </>
              )}
            </Button>



            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Delivery and setup fees calculated at checkout based on location and logistics requirements.
              </p>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details">
              <AccordionTrigger className="text-base font-medium">
                Product Details
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                {product.sku && (
                  <div className="flex justify-between">
                    <span>SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-medium">{product.weight} lbs</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Minimum Rental:</span>
                  <span className="font-medium">
                    {product.minimum_rental_days || 1} {(product.minimum_rental_days || 1) === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

            {product.care_instructions && (
              <AccordionItem value="care">
                <AccordionTrigger className="text-base font-medium">
                  Care Instructions
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {product.care_instructions}
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="rental">
              <AccordionTrigger className="text-base font-medium">
                Rental Information
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Standard rental period includes 24-hour use</p>
                <p>• Delivery typically occurs the day before your event</p>
                <p>• Pickup scheduled for the day after your event</p>
                <p>• Setup and installation available for additional fee</p>
                <p>• Damage waiver included with all rentals</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div >

    {/* Related Products Section */ }
  {
    product && allProducts.length > 0 && (
      <div className="container mx-auto px-4 md:px-6 pb-20">
        <Separator className="mb-12" />
        <RelatedProducts
          currentProduct={product}
          allProducts={allProducts}
          onAddToCart={toggleCart}
          isInCart={isInCartFn}
          maxItems={4}
        />
      </div>
    )
  }
    </div >
  )
}
