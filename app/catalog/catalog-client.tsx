'use client'

import { useState, useMemo, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ProductCard } from '@/components/product-card'
import { SearchBar } from '@/components/catalog/search-bar'
import { CategoryCard } from '@/components/catalog/category-card'
import { FeaturedProductCard } from '@/components/catalog/featured-product-card'
import { DealCard } from '@/components/catalog/deal-card'
import { CarouselSection } from '@/components/catalog/carousel-section'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutGrid, List, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: string | null
    categories?: { name: string } | null
    is_featured?: boolean
    rental_price_daily?: number
}

interface Category {
    id: string
    name: string
    image_url?: string | null
    is_featured?: boolean
}

interface Package {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    is_featured?: boolean
}

interface CatalogClientProps {
    heroTitle?: string
    products: Product[]
    categories: Category[]
    packages: Package[]
}

// Enhanced Catalog Hero Section with Parallax Effects
function CatalogHeroSection({
    title,
    subtitle,
    searchQuery,
    onSearchChange,
    onBackToCatalog
}: {
    title: string
    subtitle: string
    searchQuery: string
    onSearchChange: (query: string) => void
    onBackToCatalog?: () => void
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05])

    return (
        <div ref={containerRef} className="relative h-[70vh] min-h-[600px] w-full overflow-hidden bg-black">
            <motion.div style={{ y, scale }} className="absolute inset-0 w-full h-full">
                <Image
                    src="/luxury-event-setup-ballroom-chandelier.jpg"
                    alt="Luxury Event Catalog"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
            </motion.div>

            <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4 md:px-6 z-10">
                <motion.div
                    style={{ opacity }}
                    className="max-w-4xl space-y-8"
                >
                    {onBackToCatalog && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="flex justify-center mb-4"
                        >
                            <Button
                                variant="outline"
                                onClick={onBackToCatalog}
                                className="text-white border-white/30 hover:bg-white/10 hover:border-white text-sm h-10 px-6 rounded-full bg-transparent backdrop-blur-sm"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Catalog
                            </Button>
                        </motion.div>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-serif text-white tracking-tight leading-tight"
                    >
                        {title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        {subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                        className="w-full max-w-2xl mx-auto"
                    >
                        <SearchBar
                            value={searchQuery}
                            onChange={onSearchChange}
                            placeholder="Search for products, categories, or packages..."
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="flex flex-col items-center gap-4 pt-8"
                    >
                        <span className="text-xs uppercase tracking-[0.2em] text-white/60">Discover More</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-px h-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}

export default function CatalogClient({ heroTitle, products, categories, packages }: CatalogClientProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const selectedCategory = searchParams.get('category')

    // Filter logic
    const filteredProducts = useMemo(() => {
        let filtered = products

        if (selectedCategory) {
            filtered = filtered.filter(p => p.categories?.name === selectedCategory)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [products, selectedCategory, searchQuery])

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories
        const query = searchQuery.toLowerCase()
        return categories.filter(c => c.name.toLowerCase().includes(query))
    }, [categories, searchQuery])

    const featuredPackages = useMemo(() => {
        return packages.filter(p => p.is_featured)
    }, [packages])

    const featuredProducts = useMemo(() => {
        return products.filter(p => p.is_featured)
    }, [products])

    // Handlers
    const handleCategoryClick = (categoryName: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('category', categoryName)
        router.push(`${pathname}?${params.toString()}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleBackToCatalog = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('category')
        router.push(`${pathname}?${params.toString()}`)
        setSearchQuery('')
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen bg-background pb-20"
        >
            {/* Enhanced Hero Section with Parallax */}
            <CatalogHeroSection
                title={selectedCategory ? selectedCategory : (heroTitle || "Rental Catalog")}
                subtitle={selectedCategory
                    ? `Browse our collection of ${selectedCategory.toLowerCase()}.`
                    : "Explore our premium collection of event rentals, packages, and exclusive deals."
                }
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onBackToCatalog={selectedCategory ? handleBackToCatalog : undefined}
            />

            {/* Main Content with Scroll Reveals */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="container mx-auto px-4"
            >
                {/* Smooth Category Transitions */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory || 'main-catalog'}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                            opacity: { duration: 0.3 },
                            y: { duration: 0.4 },
                            scale: { duration: 0.4 }
                        }}
                    >
                        {/* Enhanced Category View with Scroll Reveals */}
                        {selectedCategory ? (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex items-center justify-between mb-8"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    onClick={handleBackToCatalog}
                                    className="hover:text-gold transition-all duration-300 hover:shadow-lg"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Catalog
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="flex items-center gap-2 border rounded-lg p-1 bg-secondary/50 backdrop-blur-sm"
                            >
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewMode('grid')}
                                        className="h-8 w-8 transition-all duration-200"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        onClick={() => setViewMode('list')}
                                        className="h-8 w-8 transition-all duration-200"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className={cn(
                                "grid gap-4 md:gap-6",
                                viewMode === 'grid'
                                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                    : "grid-cols-1"
                            )}
                        >
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                        ease: "easeOut"
                                    }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    {viewMode === 'grid' ? (
                                        <ProductCard product={product} />
                                    ) : (
                                        <div className="flex gap-6 border rounded-xl p-4 hover:border-gold/50 transition-all duration-300 hover:shadow-lg">
                                            <div className="relative w-48 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-between flex-grow">
                                                <div>
                                                    <h3 className="text-xl font-serif font-bold mb-2">{product.name}</h3>
                                                    <p className="text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Category: {product.categories?.name || 'Uncategorized'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-semibold text-gold">
                                                            {formatCurrency(product.rental_price_daily || product.price)}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">/ day</span>
                                                    </div>
                                                    <Button asChild>
                                                        <Link href={`/catalog/${product.id}`}>View Details</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>

                        {filteredProducts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-center py-20"
                            >
                                <p className="text-muted-foreground text-lg">No products found in this category.</p>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    // Enhanced Main Catalog View with Progressive Reveals
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="space-y-10"
                    >

                        {/* Enhanced Featured Products Carousel */}
                        {featuredProducts.length > 0 && !searchQuery && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <CarouselSection
                                    title="Featured Rentals"
                                    subtitle="Hand-picked premium pieces that define luxury and elegance"
                                >
                                    {featuredProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            className="flex-[0_0_85%] md:flex-[0_0_60%] lg:flex-[0_0_45%] min-w-0"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.5,
                                                delay: index * 0.1,
                                                ease: "easeOut"
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <FeaturedProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </CarouselSection>
                            </motion.div>
                        )}

                        {/* Enhanced Deals & Packages Carousel */}
                        {featuredPackages.length > 0 && !searchQuery && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <CarouselSection
                                    title="Special Deals & Packages"
                                    subtitle="Limited-time offers on our most popular packages"
                                    autoPlay={true}
                                    autoPlayInterval={6000}
                                >
                                    {featuredPackages.map((pkg, index) => (
                                        <motion.div
                                            key={pkg.id}
                                            className="flex-[0_0_85%] md:flex-[0_0_55%] lg:flex-[0_0_40%] min-w-0"
                                            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                                            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.6,
                                                delay: index * 0.15,
                                                ease: "easeOut"
                                            }}
                                            whileHover={{
                                                scale: 1.02,
                                                rotateY: 5,
                                                transition: { duration: 0.2 }
                                            }}
                                            style={{ perspective: 1000 }}
                                        >
                                            <DealCard
                                                name={pkg.name}
                                                description={pkg.description}
                                                price={pkg.price}
                                                imageUrl={pkg.image_url}
                                                onViewDetails={() => console.log('View package', pkg.id)}
                                                dealBadge="PACKAGE DEAL"
                                            />
                                        </motion.div>
                                    ))}
                                </CarouselSection>
                            </motion.div>
                        )}

                        {/* Enhanced Categories Grid with Interactive Navigation */}
                        <motion.section
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="text-center mb-12">
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="text-primary text-sm font-medium tracking-widest uppercase mb-4 block"
                                >
                                    Curated Collections
                                </motion.span>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="text-3xl md:text-4xl font-serif font-bold mb-6"
                                >
                                    Browse by Category
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    className="text-muted-foreground max-w-2xl mx-auto"
                                >
                                    Discover our expertly curated collections designed for every occasion
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {filteredCategories.map((category, index) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.1,
                                            ease: "easeOut"
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        className="group cursor-pointer"
                                        onClick={() => handleCategoryClick(category.name)}
                                    >
                                        <div className="relative overflow-hidden rounded-lg bg-secondary aspect-[4/3] shadow-lg hover:shadow-xl transition-all duration-300">
                                            {category.image_url ? (
                                                <Image
                                                    src={category.image_url}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                                                    <span className="text-2xl font-serif">{category.name.charAt(0)}</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                                <motion.h3
                                                    initial={{ y: 20, opacity: 0 }}
                                                    whileInView={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.2 + index * 0.1 }}
                                                    className="text-xl font-serif font-bold text-white mb-2"
                                                >
                                                    {category.name}
                                                </motion.h3>
                                                <motion.div
                                                    initial={{ y: 20, opacity: 0 }}
                                                    whileInView={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.3 + index * 0.1 }}
                                                    className="flex items-center text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                                >
                                                    <span>Explore Collection</span>
                                                    <motion.div
                                                        className="ml-2 w-4 h-4"
                                                        whileHover={{ x: 4 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        →
                                                    </motion.div>
                                                </motion.div>
                                            </div>

                                            <motion.div
                                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <ArrowLeft className="w-4 h-4 text-white transform rotate-180" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {filteredCategories.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-20"
                                >
                                    <p className="text-muted-foreground text-lg">No categories found matching your search.</p>
                                </motion.div>
                            )}
                        </motion.section>

                        {/* Enhanced All Products (if searching) */}
                        {searchQuery && (
                            <motion.section
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="space-y-6"
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <h2 className="text-2xl font-serif font-bold mb-2">Search Results</h2>
                                    <p className="text-muted-foreground">
                                        Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching "{searchQuery}"
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {filteredProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{
                                                duration: 0.4,
                                                delay: index * 0.05,
                                                ease: "easeOut"
                                            }}
                                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.section>
                        )}
                    </motion.div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}
