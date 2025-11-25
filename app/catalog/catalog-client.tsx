'use client'

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { SearchBar } from '@/components/catalog/search-bar'
import { CategoryCard } from '@/components/catalog/category-card'
import { FeaturedProductCard } from '@/components/catalog/featured-product-card'
import { DealCard } from '@/components/catalog/deal-card'
import { CarouselSection } from '@/components/catalog/carousel-section'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutGrid, List } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'

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
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 px-4 text-center bg-background border-b border-border/40">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div>
                            <span className="text-primary text-sm font-medium tracking-widest uppercase mb-4 block">
                                {selectedCategory ? 'Category' : 'Curated Collections'}
                            </span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {selectedCategory ? selectedCategory : (heroTitle || "Rental Catalog")}
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                {selectedCategory
                                    ? `Browse our collection of ${selectedCategory.toLowerCase()}.`
                                    : "Explore our premium collection of event rentals, packages, and exclusive deals."
                                }
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search for products, categories, or packages..."
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                {/* If a category is selected, show products in that category */}
                {selectedCategory ? (
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-between mb-8"
                        >
                            <Button
                                variant="ghost"
                                onClick={handleBackToCatalog}
                                className="hover:text-gold transition-all duration-300 rounded-full px-6"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Catalog
                            </Button>

                            <div className="flex items-center gap-2 border border-border/50 rounded-full p-1 bg-background/50 backdrop-blur-sm">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "h-9 w-9 rounded-full transition-all duration-300",
                                        viewMode === 'grid' && "bg-gold text-black hover:bg-gold/90"
                                    )}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "h-9 w-9 rounded-full transition-all duration-300",
                                        viewMode === 'list' && "bg-gold text-black hover:bg-gold/90"
                                    )}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={cn(
                                "grid gap-6 md:gap-8",
                                viewMode === 'grid'
                                    ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                    : "grid-cols-1"
                            )}
                        >
                            {filteredProducts.map((product, index) => (
                                viewMode === 'grid' ? (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                        className="group flex gap-6 border border-border/50 rounded-2xl p-6 hover:border-gold/50 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm"
                                    >
                                        <div className="relative w-48 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-xl bg-secondary">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-between flex-grow">
                                            <div>
                                                <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-gold transition-colors">{product.name}</h3>
                                                <p className="text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    Category: {product.categories?.name || 'Uncategorized'}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-semibold text-gold">
                                                        {formatCurrency(product.rental_price_daily || product.price)}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">/ day</span>
                                                </div>
                                                <Button asChild className="rounded-full bg-gold text-black hover:bg-gold/90 transition-all duration-300 hover:scale-105">
                                                    <Link href={`/catalog/${product.id}`}>View Details</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </motion.div>

                        {filteredProducts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20"
                            >
                                <p className="text-muted-foreground text-lg">No products found in this category.</p>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    // Main Catalog View
                    <div className="space-y-16 md:space-y-24">

                        {/* Featured Products Carousel */}
                        {featuredProducts.length > 0 && !searchQuery && (
                            <CarouselSection
                                title="Featured Rentals"
                                subtitle="Hand-picked premium pieces that define luxury and elegance"
                            >
                                {featuredProducts.map(product => (
                                    <div key={product.id} className="flex-[0_0_85%] md:flex-[0_0_60%] lg:flex-[0_0_45%] min-w-0">
                                        <FeaturedProductCard product={product} />
                                    </div>
                                ))}
                            </CarouselSection>
                        )}

                        {/* Deals & Packages Carousel */}
                        {featuredPackages.length > 0 && !searchQuery && (
                            <CarouselSection
                                title="Special Deals & Packages"
                                subtitle="Limited-time offers on our most popular packages"
                                autoPlay={true}
                                autoPlayInterval={6000}
                            >
                                {featuredPackages.map(pkg => (
                                    <div key={pkg.id} className="flex-[0_0_85%] md:flex-[0_0_55%] lg:flex-[0_0_40%] min-w-0">
                                        <DealCard
                                            name={pkg.name}
                                            description={pkg.description}
                                            price={pkg.price}
                                            imageUrl={pkg.image_url}
                                            onViewDetails={() => console.log('View package', pkg.id)}
                                            dealBadge="PACKAGE DEAL"
                                        />
                                    </div>
                                ))}
                            </CarouselSection>
                        )}

                        {/* Categories Grid */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="mb-12">
                                <span className="text-primary text-sm font-medium tracking-widest uppercase mb-2 block">
                                    Explore Collections
                                </span>
                                <h2 className="text-3xl md:text-5xl font-serif mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Browse by Category
                                </h2>
                                <p className="text-muted-foreground max-w-2xl">
                                    Discover our curated collections of premium event rentals.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredCategories.map((category, index) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <CategoryCard
                                            name={category.name}
                                            imageUrl={category.image_url}
                                            onClick={() => handleCategoryClick(category.name)}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {filteredCategories.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No categories found matching your search.</p>
                                </div>
                            )}
                        </motion.section>

                        {/* All Products (if searching) */}
                        {searchQuery && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-3xl md:text-5xl font-serif mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        Search Results
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {filteredProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
