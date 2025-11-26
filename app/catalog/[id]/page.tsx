"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, Plus, Minus, Package, Truck, Calendar as CalendarIcon, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
import { formatCurrency, cn } from "@/lib/utils"
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

interface ProductImage {
  id: string
  image_url: string
  alt_text: string
  display_order: number
  modifier_id?: string
  option_id?: string
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
  product_images?: ProductImage[]
  categories?: { name: string }
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption>>({})
  const [quantity, setQuantity] = useState(1)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | undefined>(undefined)


  const { items, addItem, removeItem, updateQuantity: updateCartQuantity } = useCart()
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), categories(name)')
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

  const cartItem = items.find((item) =>
    item.productId === product.id &&
    JSON.stringify(item.modifiers || {}) === JSON.stringify(selectedModifiers)
  )
  const isInCart = !!cartItem

  // Helper to check if ANY variant of this product is in cart (for related products etc)
  const isProductInCart = (productId: string) => items.some((item) => item.productId === productId)

  const maxQuantity = 100

  const basePrice = product.rental_price_daily || product.price
  const modifiersPrice = Object.values(selectedModifiers).reduce((acc, curr) => acc + curr.priceAdjustment, 0)
  const setupFee = product.setup_fee || 0
  const subtotal = (basePrice + modifiersPrice) * quantity
  const totalPrice = subtotal + setupFee

  const toggleCart = () => {
    if (isInCart) {
      if (cartItem) removeItem(cartItem.id)
    } else {
      addItem(product.id, quantity, selectedModifiers)
    }
  }

  const handleModifierChange = (modifierId: string, optionId: string) => {
    const modifier = product.modifiers?.find(m => m.id === modifierId)
    const option = modifier?.options?.find(o => o.id === optionId)
    if (modifier && option) {
      setSelectedModifiers(prev => ({
        ...prev,
        [modifierId]: option
      }))

      // Check if there's an image for this modifier option
      const matchingImage = product.product_images?.find(
        img => img.modifier_id === modifierId && img.option_id === optionId
      )

      if (matchingImage) {
        setSelectedGalleryImage(matchingImage.image_url)
      }
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

  const galleryImages = product.product_images && product.product_images.length > 0
    ? [product.image_url, ...product.product_images.sort((a, b) => a.display_order - b.display_order).map(img => img.image_url)]
    : product.images && product.images.length > 0
      ? product.images
      : [product.image_url]

  // Remove duplicates
  const uniqueGalleryImages = Array.from(new Set(galleryImages))

  const canAddToCart = true

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={product.categories?.name ? `/catalog?category=${encodeURIComponent(product.categories.name)}` : "/catalog"}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-gold transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to {product.categories?.name || 'Collection'}
          </Link>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-20 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
            transition={{ duration: 0.6 }}
            className="sticky top-24"
          >
            <ProductGallery
              images={uniqueGalleryImages}
              productName={product.name}
              selectedImage={selectedGalleryImage}
            />
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-8"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="text-xs uppercase tracking-wider border-gold/50 text-gold">
                  {product.sku || 'Product'}
                </Badge>
                {product.categories?.name && (
                  <Badge variant="secondary" className="text-xs uppercase tracking-wider bg-secondary/50">
                    {product.categories.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-foreground leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-bold text-gold">
                  {formatCurrency(basePrice)}
                </span>
                <span className="text-base text-muted-foreground">/ day</span>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* Description */}
            <div className="prose prose-stone max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm bg-secondary/50">
                    {feature}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="bg-border/40" />

            {/* Quantity Selector */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-12 w-12 rounded-full border-border/50"
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
                    }
                  }}
                  className="w-20 text-center h-12 text-lg bg-transparent border-border/50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= maxQuantity}
                  className="h-12 w-12 rounded-full border-border/50"
                >
                  <Plus className="h-4 w-4" />
                </Button>

              </div>
            </div>

            {/* Modifiers Section */}
            {product.modifiers && product.modifiers.length > 0 && (
              <>
                <Separator className="bg-border/40" />
                <div className="space-y-6">
                  <Label className="text-base font-medium">Customize Your Rental</Label>
                  {product.modifiers.map((modifier) => (
                    <div key={modifier.id} className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {modifier.name}
                      </Label>
                      <RadioGroup
                        onValueChange={(value: string) => handleModifierChange(modifier.id, value)}
                        value={selectedModifiers[modifier.id]?.id}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {modifier.options?.map((option) => (
                            <div
                              key={option.id}
                              className={cn(
                                "flex items-center space-x-2 border rounded-sm p-4 transition-all duration-300 cursor-pointer",
                                selectedModifiers[modifier.id]?.id === option.id
                                  ? "border-gold bg-gold/5"
                                  : "border-border/50 hover:border-gold/30 hover:bg-secondary/30"
                              )}
                              onClick={() => handleModifierChange(modifier.id, option.id)}
                            >
                              <RadioGroupItem value={option.id} id={option.id} className="text-gold border-muted-foreground" />
                              <Label htmlFor={option.id} className="cursor-pointer flex-1 font-medium">
                                <div className="flex justify-between items-center w-full">
                                  <span>{option.label}</span>
                                  {option.priceAdjustment > 0 && (
                                    <span className="text-gold text-sm">
                                      +{formatCurrency(option.priceAdjustment)}
                                    </span>
                                  )}
                                </div>
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

            <Separator className="bg-border/40" />

            {/* Add to Cart - Sticky on Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border/20 lg:static lg:p-0 lg:bg-transparent lg:border-none z-50">
              <div className="container mx-auto lg:px-0 flex flex-col gap-4">
                <div className="lg:hidden flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Estimate</span>
                  <span className="text-xl font-bold text-gold">{formatCurrency(totalPrice)}</span>
                </div>

                <div className="space-y-4">
                  <Button
                    size="lg"
                    className={cn(
                      "w-full text-lg h-14 rounded-full transition-all duration-300",
                      isInCart && cartItem?.quantity === quantity
                        ? "border-2 border-gold bg-transparent text-gold hover:bg-gold/10"
                        : "bg-gold text-black hover:bg-gold/90 shadow-lg hover:shadow-gold/20 hover:scale-[1.02]"
                    )}
                    onClick={() => {
                      if (isInCart) {
                        if (cartItem?.quantity !== quantity) {
                          if (cartItem) updateCartQuantity(cartItem.id, quantity)
                        } else {
                          if (cartItem) removeItem(cartItem.id)
                        }
                      } else {
                        addItem(product.id, quantity, selectedModifiers)
                      }
                    }}
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

                  <div className="hidden lg:flex items-start gap-2 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-sm border border-border/20">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-gold" />
                    <p>
                      Delivery and setup fees calculated at checkout based on location and logistics requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-border/40 hidden lg:block" />

            {/* Additional Information */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details" className="border-border/40">
                <AccordionTrigger className="text-base font-medium hover:text-gold transition-colors">
                  Product Details
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                  {product.sku && (
                    <div className="flex justify-between py-1 border-b border-border/20">
                      <span>SKU</span>
                      <span className="font-medium text-foreground">{product.sku}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between py-1 border-b border-border/20">
                      <span>Weight</span>
                      <span className="font-medium text-foreground">{product.weight} lbs</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span>Minimum Rental</span>
                    <span className="font-medium text-foreground">
                      {product.minimum_rental_days || 1} {(product.minimum_rental_days || 1) === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {product.care_instructions && (
                <AccordionItem value="care" className="border-border/40">
                  <AccordionTrigger className="text-base font-medium hover:text-gold transition-colors">
                    Care Instructions
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {product.care_instructions}
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="rental" className="border-border/40">
                <AccordionTrigger className="text-base font-medium hover:text-gold transition-colors">
                  Rental Information
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3 items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                    <p>Standard rental period includes 24-hour use</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                    <p>Delivery typically occurs the day before your event</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                    <p>Pickup scheduled for the day after your event</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                    <p>Setup and installation available for additional fee</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                    <p>Damage waiver included with all rentals</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </div>


      {/* Related Products Section */}
      {
        product && allProducts.length > 0 && (
          <div className="container mx-auto px-4 md:px-6 pb-20 md:pb-32">
            <Separator className="mb-12 md:mb-16 bg-border/40" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-12 text-center md:text-left">
                <span className="text-gold text-sm font-medium tracking-widest uppercase mb-2 block">
                  Complete Your Look
                </span>
                <h2 className="text-3xl md:text-5xl font-serif mb-4 text-foreground">
                  You May Also Like
                </h2>
                <div className="h-1 w-20 bg-gold mx-auto md:mx-0" />
              </div>
              <RelatedProducts
                currentProduct={product}
                allProducts={allProducts}
                onAddToCart={toggleCart}
                isInCart={isProductInCart}
                maxItems={4}
              />
            </motion.div>
          </div>
        )
      }
    </div >
  )
}
