'use client'

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Plus, Minus, Star, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
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
    categories?: { name: string, slug?: string }
    slug?: string
}

interface ProductDetailClientProps {
    product: Product
    allProducts: Product[]
}

export function ProductDetailClient({ product, allProducts }: ProductDetailClientProps) {
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption>>({})
    const [quantity, setQuantity] = useState(1)
    const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | undefined>(undefined)

    const { items, addItem, removeItem } = useCart()
    const [isLoaded] = useState(true)

    const cartItem = items.find((item) =>
        item.productId === product.id &&
        JSON.stringify(item.modifiers || {}) === JSON.stringify(selectedModifiers)
    )
    const isInCart = !!cartItem

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
            toast.info("Removed from cart", {
                description: `${product.name} has been removed from your quote.`
            })
        } else {
            addItem(product.id, quantity, selectedModifiers)
            toast.custom((t) => (
                <div className="flex items-center gap-4 bg-white border border-border/40 p-4 rounded-xl shadow-2xl w-full max-w-md">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <Image
                            src={selectedGalleryImage || product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-medium text-foreground truncate">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                            Added to quote • {quantity} {quantity === 1 ? 'unit' : 'units'}
                        </p>
                    </div>
                </div>
            ), { duration: 3000 })
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

    const galleryImages = [
        product.image_url,
        ...(Array.isArray(product.images) ? product.images : []),
        ...(product.product_images?.sort((a, b) => a.display_order - b.display_order).map(img => img.image_url) || [])
    ].filter(Boolean) as string[]

    const uniqueGalleryImages = Array.from(new Set(galleryImages))

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
        <div className="min-h-screen bg-[#FDFBF7]">
            {/* Navigation Bar */}
            <div className="sticky top-0 z-40 bg-[#FDFBF7]/80 backdrop-blur-xl border-b border-border/10">
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link
                            href={product.categories?.name ? `/catalog?category=${encodeURIComponent(product.categories.name)}` : "/catalog"}
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-gold transition-colors group font-medium"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to {product.categories?.name || 'Collection'}
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="product-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                            {/* Image Gallery */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
                                transition={{ duration: 0.6 }}
                                className="lg:sticky lg:top-32"
                            >
                                <ProductGallery
                                    images={uniqueGalleryImages}
                                    productName={product.name}
                                    className="shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden"
                                >
                                    {/* Product Gallery renders its own content */}
                                </ProductGallery>
                            </motion.div>

                            {/* Details Section */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate={isLoaded ? "visible" : "hidden"}
                                className="flex flex-col gap-8"
                            >
                                {/* Product Information */}
                                <motion.div variants={itemVariants} className="space-y-6">
                                    <div>
                                        <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase block mb-3 opacity-80">
                                            {product.categories?.name || 'Premium Rental'}
                                        </span>
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground font-light tracking-tight leading-[1.1]">
                                            {product.name}
                                        </h1>
                                    </div>

                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-light text-foreground">
                                            {formatCurrency(basePrice)}
                                        </span>
                                        <span className="text-sm text-muted-foreground uppercase tracking-widest">per day</span>
                                    </div>

                                    <div className="max-w-xl">
                                        <p className="text-lg text-muted-foreground/80 leading-relaxed font-light">
                                            {product.description}
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <Separator className="bg-border/20" />
                                </motion.div>

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                    <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                                        {product.features.map((feature, idx) => (
                                            <Badge key={idx} variant="outline" className="px-4 py-1.5 rounded-full border-border/40 bg-white/50 text-xs font-medium tracking-wide">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Quantity Selector */}
                                <motion.div variants={itemVariants} className="space-y-4">
                                    <Label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Quantity</Label>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center border border-border/20 rounded-full p-1 bg-white shadow-sm">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={decrementQuantity}
                                                disabled={quantity <= 1}
                                                className="h-12 w-12 rounded-full hover:bg-gold/10 hover:text-gold transition-colors"
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
                                                className="w-16 text-center h-12 text-xl bg-transparent border-none focus-visible:ring-0 p-0 font-light"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={incrementQuantity}
                                                disabled={quantity >= maxQuantity}
                                                className="h-12 w-12 rounded-full hover:bg-gold/10 hover:text-gold transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Modifiers Section */}
                                {product.modifiers && product.modifiers.length > 0 && (
                                    <motion.div variants={itemVariants} className="space-y-8">
                                        <div className="space-y-8">
                                            {product.modifiers.map((modifier) => (
                                                <div key={modifier.id} className="space-y-4">
                                                    <Label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
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
                                                                        "relative flex items-center space-x-3 border rounded-2xl p-5 transition-all duration-500 cursor-pointer overflow-hidden group",
                                                                        selectedModifiers[modifier.id]?.id === option.id
                                                                            ? "border-gold bg-white shadow-xl shadow-gold/5"
                                                                            : "border-border/10 bg-white/40 hover:border-gold/30 hover:bg-white"
                                                                    )}
                                                                    onClick={() => handleModifierChange(modifier.id, option.id)}
                                                                >
                                                                    <RadioGroupItem value={option.id} id={option.id} className="text-gold border-muted-foreground/20 data-[state=checked]:border-gold z-10" />
                                                                    <Label htmlFor={option.id} className="cursor-pointer flex-1 font-medium z-10 text-base">
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <span className="font-light">{option.label}</span>
                                                                            {option.priceAdjustment > 0 && (
                                                                                <span className="text-gold text-sm font-medium">
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
                                    <Separator className="bg-border/20" />
                                </motion.div>

                                {/* Pricing Summary */}
                                <motion.div variants={itemVariants} className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xl font-light">
                                            <span className="text-muted-foreground">Total</span>
                                            <span className="text-3xl text-foreground">{formatCurrency(totalPrice)}</span>
                                        </div>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <Button
                                        onClick={toggleCart}
                                        className={cn(
                                            "w-full h-16 text-lg font-medium rounded-full transition-all duration-500 shadow-lg",
                                            isInCart
                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                : "bg-gold hover:bg-gold/90 text-black hover:shadow-gold/20 hover:-translate-y-1"
                                        )}
                                    >
                                        {isInCart ? (
                                            <div className="flex items-center gap-3">
                                                <Check className="h-6 w-6" />
                                                Added to Quote
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Plus className="h-6 w-6" />
                                                Add to Quote
                                            </div>
                                        )}
                                    </Button>
                                </motion.div>

                                {/* Additional Information */}
                                <motion.div variants={itemVariants} className="pt-8">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="details" className="border-border/10">
                                            <AccordionTrigger className="text-lg font-serif font-light hover:text-gold transition-colors py-6">
                                                Product Details
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 text-base text-muted-foreground/80 pb-6 font-light">
                                                {product.sku && (
                                                    <div className="flex justify-between py-2 border-b border-border/10 border-dashed">
                                                        <span>SKU</span>
                                                        <span className="font-medium text-foreground">{product.sku}</span>
                                                    </div>
                                                )}
                                                {product.weight && (
                                                    <div className="flex justify-between py-2 border-b border-border/10 border-dashed">
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
                                            <AccordionItem value="care" className="border-border/10">
                                                <AccordionTrigger className="text-lg font-serif font-light hover:text-gold transition-colors py-6">
                                                    Care Instructions
                                                </AccordionTrigger>
                                                <AccordionContent className="text-base text-muted-foreground/80 leading-relaxed pb-6 font-light">
                                                    {product.care_instructions}
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}

                                        <AccordionItem value="rental" className="border-border/10">
                                            <AccordionTrigger className="text-lg font-serif font-light hover:text-gold transition-colors py-6">
                                                Rental Information
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-6 text-base text-muted-foreground/80 pb-6 font-light">
                                                <div className="grid gap-4">
                                                    <div className="flex gap-4 items-start">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                                                        <p>Standard rental period includes 24-hour use</p>
                                                    </div>
                                                    <div className="flex gap-4 items-start">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                                                        <p>Delivery typically occurs the day before your event</p>
                                                    </div>
                                                    <div className="flex gap-4 items-start">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                                                        <p>Pickup scheduled for the day after your event</p>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Related Products Section */}
            {product && allProducts.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/30 border-t border-border/10"
                >
                    <div className="container mx-auto px-4 md:px-6 py-24 md:py-32">
                        <div className="mb-20 text-center">
                            <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4 block opacity-80">
                                Complete Your Look
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 text-foreground tracking-tight">
                                You May Also Like
                            </h2>
                            <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto font-light">
                                Discover complementary pieces to create the perfect atmosphere for your event.
                            </p>
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
            )}
        </div>
    )
}
