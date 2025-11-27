"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, Plus, Minus, Package, Truck, Calendar as CalendarIcon, Info, ShieldCheck, Star } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductGallery } from "@/components/product-gallery"
import { RelatedProducts } from "@/components/related-products"
import { formatCurrency, cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from "next/image"

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
  const { scrollY } = useScroll()
  const supabase = createClient()

  // Parallax effects for hero
  const heroY = useTransform(scrollY, [0, 500], [0, 200])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          <div className="text-gold font-serif text-lg">Loading...</div>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Immersive Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-black">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-background" />
        </motion.div>

        <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4 md:px-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl space-y-4"
          >
            <span className="text-gold text-sm md:text-base font-medium tracking-[0.2em] uppercase block">
              {product.categories?.name || 'Premium Rental'}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white font-medium tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline justify-center gap-3 pt-2">
              <span className="text-2xl md:text-3xl font-medium text-white">
                {formatCurrency(basePrice)}
              </span>
              <span className="text-base text-gray-200 font-light">/ day</span>
            </div>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
              {product.description.length > 150
                ? `${product.description.substring(0, 150)}...`
                : product.description
              }
            </p>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Search & Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href={product.categories?.name ? `/catalog?category=${encodeURIComponent(product.categories.name)}` : "/catalog"}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-gold transition-colors group font-medium tracking-wide"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to {product.categories?.name || 'Collection'}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key="product-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-12 md:space-y-20"
          >
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
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
              className="shadow-2xl shadow-black/5"
            />
          </motion.div>

          {/* Details Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            className="flex flex-col gap-10"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3">
                {product.categories?.name && (
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
                    {product.categories.name}
                  </span>
                )}
                {product.sku && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      SKU: {product.sku}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl md:text-3xl font-medium text-foreground">
                  {formatCurrency(basePrice)}
                </span>
                <span className="text-base text-muted-foreground font-light">/ day</span>
              </div>

              {/* Results Summary */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-left"
              >
                <p className="text-muted-foreground text-lg font-light leading-relaxed">
                  Premium {product.categories?.name.toLowerCase() || 'rental'} piece for extraordinary events.
                </p>
                <div className="h-1 w-16 bg-gold mt-4" />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Separator className="bg-border/40" />
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="prose prose-stone max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground/90 font-light">
                {product.description}
              </p>
            </motion.div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-secondary/20 text-sm text-foreground/80">
                    <Star className="h-3 w-3 text-gold fill-gold" />
                    <span>{feature}</span>
                  </div>
                ))}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Separator className="bg-border/40" />
            </motion.div>


            {/* Quantity Selector */}
            <motion.div variants={itemVariants} className="space-y-4">
              <Label className="text-base font-medium">Quantity</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border/50 rounded-full p-1 bg-secondary/10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-full hover:bg-gold/10 hover:text-gold transition-colors"
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
                    className="w-16 text-center h-10 text-lg bg-transparent border-none focus-visible:ring-0 p-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= maxQuantity}
                    className="h-10 w-10 rounded-full hover:bg-gold/10 hover:text-gold transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.quantity_available ? `${product.quantity_available} available` : 'In Stock'}
                </span>
              </div>
            </motion.div>

            {/* Modifiers Section */}
            {product.modifiers && product.modifiers.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Separator className="flex-1 bg-border/40" />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Customization</span>
                    <Separator className="flex-1 bg-border/40" />
                  </div>

                  {product.modifiers.map((modifier) => (
                    <div key={modifier.id} className="space-y-4">
                      <Label className="text-base font-medium text-foreground">
                        {modifier.name}
                      </Label>
                      <RadioGroup
                        onValueChange={(value: string) => handleModifierChange(modifier.id, value)}
                        value={selectedModifiers[modifier.id]?.id}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {modifier.options?.map((option) => (
                            <div
                              key={option.id}
                              className={cn(
                                "relative flex items-center space-x-3 border rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden group",
                                selectedModifiers[modifier.id]?.id === option.id
                                  ? "border-gold bg-gold/5 shadow-lg shadow-gold/5"
                                  : "border-border/40 hover:border-gold/30 hover:bg-secondary/20"
                              )}
                              onClick={() => handleModifierChange(modifier.id, option.id)}
                            >
                              <div className={cn(
                                "absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent opacity-0 transition-opacity duration-300",
                                selectedModifiers[modifier.id]?.id === option.id ? "opacity-100" : "group-hover:opacity-50"
                              )} />

                              <RadioGroupItem value={option.id} id={option.id} className="text-gold border-muted-foreground/40 data-[state=checked]:border-gold z-10" />
                              <Label htmlFor={option.id} className="cursor-pointer flex-1 font-medium z-10 text-base">
                                <div className="flex justify-between items-center w-full">
                                  <span>{option.label}</span>
                                  {option.priceAdjustment > 0 && (
                                    <span className="text-gold text-sm font-medium bg-gold/10 px-2 py-0.5 rounded-full">
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
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <Separator className="bg-border/40" />
            </motion.div>

            {/* Add to Cart - Sticky on Mobile */}
            <motion.div
              variants={itemVariants}
              className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/20 lg:static lg:p-0 lg:bg-transparent lg:border-none z-50"
            >
              <div className="container mx-auto lg:px-0 flex flex-col gap-4">
                <div className="lg:hidden flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Estimate</span>
                  <span className="text-xl font-bold text-gold">{formatCurrency(totalPrice)}</span>
                </div>

                <div className="space-y-6">
                  <Button
                    size="lg"
                    className={cn(
                      "w-full text-lg h-14 rounded-full transition-all duration-500 font-medium tracking-wide",
                      isInCart && cartItem?.quantity === quantity
                        ? "border border-gold bg-transparent text-gold hover:bg-gold/5"
                        : "bg-gold text-black hover:bg-gold/90 shadow-xl shadow-gold/10 hover:shadow-gold/20 hover:scale-[1.01]"
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

                  <div className="hidden lg:flex items-start gap-4 text-sm text-muted-foreground bg-secondary/10 p-5 rounded-xl border border-border/30">
                    <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 text-gold">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground text-base">Worry-Free Rental</p>
                      <p className="leading-relaxed">
                        Delivery and setup fees calculated at checkout. Damage waiver included.
                        Professional cleaning included with every rental.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Separator className="bg-border/40 hidden lg:block" />
            </motion.div>

            {/* Additional Information */}
            <motion.div variants={itemVariants}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details" className="border-border/40">
                  <AccordionTrigger className="text-lg font-serif hover:text-gold transition-colors py-6">
                    Product Details
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-base text-muted-foreground pb-6">
                    {product.sku && (
                      <div className="flex justify-between py-2 border-b border-border/20 border-dashed">
                        <span>SKU</span>
                        <span className="font-medium text-foreground">{product.sku}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between py-2 border-b border-border/20 border-dashed">
                        <span>Weight</span>
                        <span className="font-medium text-foreground">{product.weight} lbs</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span>Minimum Rental</span>
                      <span className="font-medium text-foreground">
                        {product.minimum_rental_days || 1} {(product.minimum_rental_days || 1) === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {product.care_instructions && (
                  <AccordionItem value="care" className="border-border/40">
                    <AccordionTrigger className="text-lg font-serif hover:text-gold transition-colors py-6">
                      Care Instructions
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                      {product.care_instructions}
                    </AccordionContent>
                  </AccordionItem>
                )}

                <AccordionItem value="rental" className="border-border/40">
                  <AccordionTrigger className="text-lg font-serif hover:text-gold transition-colors py-6">
                    Rental Information
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-base text-muted-foreground pb-6">
                    <div className="flex gap-4 items-start">
                      <div className="h-2 w-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <p>Standard rental period includes 24-hour use</p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-2 w-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <p>Delivery typically occurs the day before your event</p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-2 w-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <p>Pickup scheduled for the day after your event</p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-2 w-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <p>Setup and installation available for additional fee</p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="h-2 w-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <p>Damage waiver included with all rentals</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </motion.div>
        </div>
      </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Products Section */}
      {
        product && allProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-secondary/5"
          >
            <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
              <Separator className="mb-16 md:mb-24 bg-border/40" />
              <div className="mb-16 text-center">
                <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
                  Complete Your Look
                </span>
                <h2 className="text-3xl md:text-5xl font-serif mb-4 text-foreground">
                  You May Also Like
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover complementary pieces to create the perfect atmosphere for your event.
                </p>
                <div className="h-1 w-20 bg-gold mx-auto mt-6" />
              </div>
              <RelatedProducts
                currentProduct={product}
                allProducts={allProducts}
                onAddToCart={toggleCart}
                isInCart={isProductInCart}
                maxItems={4}
              />
            </div>
          </motion.section>
        )
      }
    </div >
  )
}
