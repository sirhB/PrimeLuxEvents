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
        <div className="min-h-screen bg-[#1A1A1A] text-white selection:bg-gold selection:text-black">
            <div className="absolute inset-0 bg-[url('/images/luxury-texture.png')] opacity-5 mix-blend-overlay pointer-events-none" />

            {/* Top Blur Effect */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation Bar */}
            <div className="sticky top-0 z-40 bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Link
                            href={product.categories?.name ? `/catalog?category=${encodeURIComponent(product.categories.name)}` : "/catalog"}
                            className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-gold transition-all duration-500 group"
                        >
                            <ArrowLeft className="mr-2 h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                            Back to {product.categories?.name || 'Collection'}
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="product-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
                            {/* Image Gallery */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="lg:sticky lg:top-36"
                            >
                                <ProductGallery
                                    images={uniqueGalleryImages}
                                    productName={product.name}
                                    className="shadow-[0_40px_100px_rgba(0,0,0,0.4)] rounded-[2rem] overflow-hidden border border-white/5"
                                >
                                </ProductGallery>
                            </motion.div>

                            {/* Details Section */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate={isLoaded ? "visible" : "hidden"}
                                className="flex flex-col gap-10"
                            >
                                {/* Product Information */}
                                <motion.div variants={itemVariants} className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="h-px w-8 bg-gold/50" />
                                            <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase opacity-80">
                                                {product.categories?.name || 'Premium Rental'}
                                            </span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white font-light tracking-tight leading-[1.1] selection:text-gold">
                                            {product.name}
                                        </h1>
                                    </div>

                                    <div className="flex items-baseline gap-4">
                                        <span className="text-4xl font-serif text-gold font-light">
                                            {formatCurrency(basePrice)}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">per event day</span>
                                    </div>

                                    <div className="max-w-2xl">
                                        <p className="text-lg text-gray-400 leading-relaxed font-light">
                                            {product.description}
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                                </motion.div>

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                    <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
                                        {product.features.map((feature, idx) => (
                                            <Badge key={idx} variant="outline" className="px-5 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold tracking-widest uppercase text-gray-300 hover:bg-gold/10 hover:text-gold hover:border-gold/20 transition-all duration-300">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Quantity Selector */}
                                <motion.div variants={itemVariants} className="space-y-5">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Selection Quantity</Label>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center border border-white/5 rounded-full p-1.5 bg-white/5 backdrop-blur-sm shadow-inner group transition-all duration-500 hover:border-white/10">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={decrementQuantity}
                                                disabled={quantity <= 1}
                                                className="h-12 w-12 rounded-full hover:bg-gold hover:text-black transition-all duration-500 disabled:opacity-20"
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
                                                className="w-20 text-center h-12 text-2xl bg-transparent border-none focus-visible:ring-0 p-0 font-serif text-white selection:bg-gold"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={incrementQuantity}
                                                disabled={quantity >= maxQuantity}
                                                className="h-12 w-12 rounded-full hover:bg-gold hover:text-black transition-all duration-500 disabled:opacity-20"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Modifiers Section */}
                                {product.modifiers && product.modifiers.length > 0 && (
                                    <motion.div variants={itemVariants} className="space-y-10">
                                        <div className="space-y-10">
                                            {product.modifiers.map((modifier) => (
                                                <div key={modifier.id} className="space-y-5">
                                                    <Label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">
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
                                                                        "relative flex items-center space-x-4 border rounded-[1.5rem] p-6 transition-all duration-500 cursor-pointer overflow-hidden group",
                                                                        selectedModifiers[modifier.id]?.id === option.id
                                                                            ? "border-gold bg-gold/5 shadow-[0_10px_40px_rgba(212,175,55,0.1)]"
                                                                            : "border-white/5 bg-white/5 hover:border-gold/30 hover:bg-white/10"
                                                                    )}
                                                                    onClick={() => handleModifierChange(modifier.id, option.id)}
                                                                >
                                                                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-700 opacity-20" />

                                                                    <RadioGroupItem value={option.id} id={option.id} className="text-gold border-white/20 data-[state=checked]:border-gold z-10" />
                                                                    <Label htmlFor={option.id} className="cursor-pointer flex-1 font-medium z-10 text-base">
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <span className="font-serif text-lg font-light text-white">{option.label}</span>
                                                                            {option.priceAdjustment > 0 && (
                                                                                <span className="text-gold text-sm font-light">
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
                                    <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                                </motion.div>

                                {/* Pricing Summary */}
                                <motion.div variants={itemVariants} className="space-y-10">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-1">Subtotal</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-4xl md:text-5xl font-serif text-white font-light tracking-tight">{formatCurrency(totalPrice)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <Button
                                        onClick={toggleCart}
                                        className={cn(
                                            "w-full h-20 text-[11px] font-bold uppercase tracking-[0.3em] rounded-full transition-all duration-700 group relative overflow-hidden shadow-2xl",
                                            isInCart
                                                ? "bg-white text-black hover:bg-white/90"
                                                : "bg-gold text-black hover:bg-white"
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                        <span className="relative z-10 flex items-center justify-center gap-4">
                                            {isInCart ? (
                                                <>
                                                    <Check className="h-5 w-5" />
                                                    Included in Selection
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-500" />
                                                    Add to Collection
                                                </>
                                            )}
                                        </span>
                                    </Button>

                                    <div className="flex items-center justify-center gap-8 py-4 px-6 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                            <ShieldCheck className="h-3 w-3 text-gold" /> Secure Reservation
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                            <Star className="h-3 w-3 text-gold" /> Premium Support
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Additional Information */}
                                <motion.div variants={itemVariants} className="pt-10">
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        <AccordionItem value="details" className="border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden px-8 transition-all duration-500 hover:border-white/10">
                                            <AccordionTrigger className="text-lg font-serif font-light text-white hover:text-gold transition-all duration-500 py-6 border-none">
                                                Specifications & Origin
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-5 text-base text-gray-400 pb-8 font-light">
                                                <div className="h-px w-full bg-white/5 mb-6" />
                                                {product.sku && (
                                                    <div className="flex justify-between py-2 border-b border-white/5 border-dashed">
                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Curated SKU</span>
                                                        <span className="text-gray-300">{product.sku}</span>
                                                    </div>
                                                )}
                                                {product.weight && (
                                                    <div className="flex justify-between py-2 border-b border-white/5 border-dashed">
                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Weight</span>
                                                        <span className="text-gray-300">{product.weight} lbs</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between py-2">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Minimum Engagement</span>
                                                    <span className="text-gray-300">
                                                        {product.minimum_rental_days || 1} {(product.minimum_rental_days || 1) === 1 ? 'day' : 'days'}
                                                    </span>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        {product.care_instructions && (
                                            <AccordionItem value="care" className="border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden px-8 transition-all duration-500 hover:border-white/10">
                                                <AccordionTrigger className="text-lg font-serif font-light text-white hover:text-gold transition-all duration-500 py-6 border-none">
                                                    Maintenance & Care
                                                </AccordionTrigger>
                                                <AccordionContent className="text-base text-gray-400 leading-relaxed pb-8 font-light">
                                                    <div className="h-px w-full bg-white/5 mb-6" />
                                                    {product.care_instructions}
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}

                                        <AccordionItem value="rental" className="border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm overflow-hidden px-8 transition-all duration-500 hover:border-white/10">
                                            <AccordionTrigger className="text-lg font-serif font-light text-white hover:text-gold transition-all duration-500 py-6 border-none">
                                                The Luxury Process
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-6 text-base text-gray-400 pb-8 font-light">
                                                <div className="h-px w-full bg-white/5 mb-6" />
                                                <div className="grid gap-5">
                                                    <div className="flex gap-4 items-start group">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform duration-500" />
                                                        <p className="group-hover:text-gray-200 transition-colors">Standard rental period includes 24-hour of seamless use</p>
                                                    </div>
                                                    <div className="flex gap-4 items-start group">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform duration-500" />
                                                        <p className="group-hover:text-gray-200 transition-colors">White-glove delivery occurs conveniently prior to your event</p>
                                                    </div>
                                                    <div className="flex gap-4 items-start group">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform duration-500" />
                                                        <p className="group-hover:text-gray-200 transition-colors">Discreet retrieval scheduled for the day following your event</p>
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
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-[#1E1E1E]/50 border-t border-white/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="container mx-auto px-4 md:px-6 py-24 md:py-40 relative z-10">
                        <div className="mb-24 text-center">
                            <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase mb-4 block opacity-80 decoration-gold/30 underline underline-offset-8">
                                Complete Your Vision
                            </span>
                            <h2 className="text-4xl md:text-6xl font-serif font-light mb-8 text-white tracking-tight">
                                Curated Pairings
                            </h2>
                            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                                Discover complementary pieces selected by our stylists to create an cohesive and extraordinary atmosphere.
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
