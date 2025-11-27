'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { CategoryCard } from '@/components/catalog/category-card'
import { FeaturedProductCard } from '@/components/catalog/featured-product-card'
import { DealCard } from '@/components/catalog/deal-card'
import { CarouselSection } from '@/components/catalog/carousel-section'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, LayoutGrid, List, Filter, X, Menu, Search, SlidersHorizontal, Grid3X3, Columns, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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
    const { scrollY } = useScroll()

    const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('name')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const selectedCategory = searchParams.get('category')

    // Parallax effect for hero
    const heroY = useTransform(scrollY, [0, 500], [0, 200])
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

    // Enhanced filter logic
    const filteredProducts = useMemo(() => {
        let filtered = products

        // Category filter
        if (selectedCategory) {
            filtered = filtered.filter(p => p.categories?.name === selectedCategory)
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.categories?.name.toLowerCase().includes(query)
            )
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return (a.rental_price_daily || a.price) - (b.rental_price_daily || b.price)
                case 'price-high':
                    return (b.rental_price_daily || b.price) - (a.rental_price_daily || a.price)
                case 'newest':
                    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                default: // name
                    return a.name.localeCompare(b.name)
            }
        })

        return filtered
    }, [products, selectedCategory, searchQuery, sortBy])

    // Featured first then alphabetically
    const orderedCategories = useMemo(() => {
        const featured = categories.filter(c => c.is_featured).sort((a, b) => a.name.localeCompare(b.name))
        const nonFeatured = categories.filter(c => !c.is_featured).sort((a, b) => a.name.localeCompare(b.name))
        return [...featured, ...nonFeatured]
    }, [categories])

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
        params.delete('search') // Reset search when changing categories
        router.push(`${pathname}?${params.toString()}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleBackToCatalog = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('category')
        params.delete('search')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        const params = new URLSearchParams(searchParams.toString())
        if (value.trim()) {
            params.set('search', value)
        } else {
            params.delete('search')
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // Initialize search from URL params
    useEffect(() => {
        const searchParam = searchParams.get('search')
        if (searchParam) {
            setSearchQuery(searchParam)
        }
    }, [searchParams])

    return (
        <div className="min-h-screen bg-background">
            {/* Immersive Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-black">
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src={selectedCategory
                            ? (categories.find(c => c.name === selectedCategory)?.image_url || "/luxury-event-setup-ballroom-chandelier.jpg")
                            : "/luxury-event-setup-ballroom-chandelier.jpg"
                        }
                        alt="Catalog Hero"
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
                        className="max-w-4xl space-y-6"
                    >
                        <span className="text-gold text-sm md:text-base font-medium tracking-[0.2em] uppercase block">
                            {selectedCategory ? 'Collection' : 'Premium Rentals'}
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white font-medium tracking-tight">
                            {selectedCategory ? selectedCategory : (heroTitle || "The Collection")}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                            {selectedCategory
                                ? `Curated selection of premium ${selectedCategory.toLowerCase()} for your extraordinary events.`
                                : "Explore our exclusive inventory of luxury event rentals, designed to transform any venue."
                            }
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Enhanced Sticky Search & Filter Bar */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/40 shadow-sm">
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products, categories..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 pr-4 h-11 border-border/50 focus:border-gold/50 rounded-full bg-background/50 transition-all duration-200 focus:bg-background"
                            />
                        </div>

                        {/* Filters and Controls */}
                        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                            {/* Category Navigation */}
                            {selectedCategory && (
                                <Button
                                    variant="outline"
                                    onClick={handleBackToCatalog}
                                    className="flex gap-2 rounded-full border-border/50 hover:bg-secondary hover:text-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">All Categories</span>
                                    <span className="sm:hidden">All</span>
                                </Button>
                            )}

                            {/* Sort Dropdown */}
                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="w-40 h-11 rounded-full border-border/50 bg-background/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name A-Z</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 border border-border/50 rounded-full p-1 bg-background/50">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "h-9 w-9 rounded-full transition-all duration-300",
                                        viewMode === 'grid' && "bg-gold text-black hover:bg-gold/90 shadow-sm"
                                    )}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('masonry')}
                                    className={cn(
                                        "h-9 w-9 rounded-full transition-all duration-300",
                                        viewMode === 'masonry' && "bg-gold text-black hover:bg-gold/90 shadow-sm"
                                    )}
                                >
                                    <Columns className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Mobile Filter Trigger */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden h-11 w-11 rounded-full border-border/50"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCategory || searchQuery) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/20"
                        >
                            {selectedCategory && (
                                <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                                    Category: {selectedCategory}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBackToCatalog}
                                        className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {searchQuery && (
                                <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                                    Search: "{searchQuery}"
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSearchChange('')}
                                        className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 md:px-6 py-8 md:py-16">
                <AnimatePresence mode="wait">
                    {/* Unified Content Layout */}
                    <motion.div
                        key={selectedCategory || 'main'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-12 md:space-y-20"
                    >
                        {/* Results Summary */}
                        {(selectedCategory || searchQuery) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center md:text-left"
                            >
                                <h2 className="text-2xl md:text-4xl font-serif mb-2 text-foreground">
                                    {selectedCategory ? selectedCategory : 'Search Results'}
                                </h2>
                                <p className="text-muted-foreground text-lg">
                                    {selectedCategory
                                        ? `Discover our premium ${selectedCategory.toLowerCase()} collection`
                                        : `Found ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} for "${searchQuery}"`
                                    }
                                </p>
                                <div className="h-1 w-16 bg-gold mx-auto md:mx-0 mt-4" />
                            </motion.div>
                        )}

                        {/* Desktop Category Sidebar (when browsing all categories) */}
                        {!selectedCategory && !searchQuery && (
                            <div className="hidden lg:block">
                                <div className="mb-8">
                                    <h2 className="text-2xl md:text-3xl font-serif mb-8 text-foreground">
                                        Browse Categories
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                    {orderedCategories.map((category, index) => (
                                        <motion.div
                                                key={category.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true, margin: "-50px" }}
                                            transition={{ duration: 0.5, delay: index * 0.05 }}
                                        >
                                            <CategoryCard
                                                name={category.name}
                                                imageUrl={category.image_url}
                                                onClick={() => handleCategoryClick(category.name)}
                                            />
                                            </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mobile Category Navigation */}
                        {!selectedCategory && !searchQuery && (
                            <div className="lg:hidden">
                                <div className="mb-8">
                                    <h2 className="text-xl md:text-2xl font-serif mb-6 text-foreground">
                                        Browse Categories
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {orderedCategories.slice(0, 6).map((category, index) => (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                        >
                                            <CategoryCard
                                                name={category.name}
                                                imageUrl={category.image_url}
                                                onClick={() => handleCategoryClick(category.name)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                                {orderedCategories.length > 6 && (
                                    <div className="mt-6 text-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsSidebarOpen(true)}
                                            className="rounded-full border-border/50"
                                        >
                                            View All Categories ({orderedCategories.length})
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Products Grid/Masonry */}
                        {filteredProducts.length > 0 && (
                            <motion.div
                                layout
                                className={cn(
                                    "transition-all duration-500",
                                    viewMode === 'grid'
                                        ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8"
                                        : "columns-1 xs:columns-2 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 sm:gap-6 md:gap-8 space-y-4 sm:space-y-6 md:space-y-8"
                                )}
                            >
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: Math.min(index * 0.03, 0.2), // Faster, capped delay for better performance
                                            layout: { duration: 0.3 }
                                        }}
                                        className={cn(
                                            viewMode === 'masonry' && "break-inside-avoid mb-4 sm:mb-6 md:mb-8",
                                            "w-full" // Ensure full width in grid mode
                                        )}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Empty State */}
                        {filteredProducts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20 md:py-32"
                            >
                                <div className="max-w-md mx-auto">
                                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-serif mb-4 text-foreground">
                                        No products found
                                    </h3>
                                    <p className="text-muted-foreground mb-8">
                                        {selectedCategory
                                            ? `We don't have any products in the ${selectedCategory} category yet.`
                                            : searchQuery
                                                ? `No products match your search for "${searchQuery}".`
                                                : "No products available at the moment."
                                        }
                                    </p>
                                    {(selectedCategory || searchQuery) && (
                                        <Button
                                            onClick={handleBackToCatalog}
                                            variant="outline"
                                            className="rounded-full"
                                        >
                                            Browse All Products
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Featured Sections (only on main catalog page) */}
                        {!selectedCategory && !searchQuery && (
                            <>
                                {/* Featured Products */}
                                {featuredProducts.length > 0 && (
                                    <motion.section
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8 }}
                                    >
                                        <div className="mb-12 text-center">
                                            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
                                                Premium Selection
                                            </span>
                                            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-foreground">
                                                Featured Collection
                                            </h2>
                                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                                Hand-picked premium pieces that define luxury and elegance for extraordinary events.
                                            </p>
                                            <div className="h-1 w-20 bg-gold mx-auto mt-6" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                            {featuredProducts.slice(0, 4).map((product, index) => (
                                                <motion.div
                                                    key={product.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                >
                                                    <ProductCard product={product} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.section>
                                )}

                                {/* Curated Packages */}
                                {featuredPackages.length > 0 && (
                                    <motion.section
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    >
                                        <div className="mb-12 text-center">
                                            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
                                                Complete Solutions
                                            </span>
                                            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-foreground">
                                                Curated Packages
                                            </h2>
                                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                                Complete event solutions designed for seamless planning and execution.
                                            </p>
                                            <div className="h-1 w-20 bg-gold mx-auto mt-6" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                            {featuredPackages.slice(0, 3).map((pkg, index) => (
                                                <motion.div
                                                    key={pkg.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.6, delay: index * 0.15 }}
                                                >
                                            <DealCard
                                                name={pkg.name}
                                                description={pkg.description}
                                                price={pkg.price}
                                                imageUrl={pkg.image_url}
                                                onViewDetails={() => console.log('View package', pkg.id)}
                                                dealBadge="PACKAGE"
                                            />
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.section>
                                )}
                            </>
                            )}
                        </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile Category Drawer */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="w-80 p-0 sm:w-96">
                    <SheetHeader className="p-6 pb-4 border-b border-border/10">
                        <SheetTitle className="text-xl font-serif flex items-center gap-2">
                            <Menu className="h-5 w-5" />
                            Browse Categories
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Explore our premium collections
                        </p>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto">
                        <nav className="px-4 py-4">
                            <div className="space-y-1">
                                {/* All Categories Option */}
                                <button
                                    className={cn(
                                        "w-full text-left px-4 py-4 rounded-xl transition-all duration-200 border-2",
                                        !selectedCategory
                                            ? "bg-gold/10 text-gold border-gold font-medium shadow-sm"
                                            : "hover:bg-secondary/30 border-transparent hover:border-border/50"
                                    )}
                                    onClick={() => {
                                        handleBackToCatalog()
                                        setIsSidebarOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                                            <LayoutGrid className="h-6 w-6 text-gold" />
                                        </div>
                                        <div>
                                            <span className="font-medium block">All Categories</span>
                                            <span className="text-sm text-muted-foreground">Browse everything</span>
                                        </div>
                                    </div>
                                </button>

                                {/* Category List */}
                                {orderedCategories.map(category => (
                                    <button
                                        key={category.id}
                                        className={cn(
                                            "w-full text-left px-4 py-4 rounded-xl transition-all duration-200 border-2",
                                            selectedCategory === category.name
                                                ? "bg-gold/10 text-gold border-gold font-medium shadow-sm"
                                                : "hover:bg-secondary/30 border-transparent hover:border-border/50"
                                        )}
                                        onClick={() => {
                                            handleCategoryClick(category.name)
                                            setIsSidebarOpen(false)
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {category.image_url ? (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                                                    <Image
                                                        src={category.image_url}
                                                        alt=""
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                                    <div className="w-6 h-6 opacity-50">
                                                        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2l5 4H7l5-4z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium block truncate">{category.name}</span>
                                                <span className="text-sm text-muted-foreground">Premium collection</span>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
