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
    created_at?: string
    slug?: string
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
        <div className="min-h-screen bg-[#FDFBF7]">
            {/* Immersive Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden bg-black">
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
                        className="object-cover opacity-50 scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFBF7]" />
                </motion.div>

                <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4 md:px-6 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl space-y-6"
                    >
                        <span className="text-gold text-xs md:text-sm font-semibold tracking-[0.4em] uppercase block opacity-90">
                            {selectedCategory ? 'Collection' : (searchQuery ? 'Search Results' : 'Premium Rentals')}
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white font-light tracking-tight leading-[1.1]">
                            {selectedCategory
                                ? selectedCategory
                                : searchQuery
                                    ? `Search Results`
                                    : (heroTitle || "The Collection")
                            }
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed opacity-80">
                            {selectedCategory
                                ? `Curated selection of premium ${selectedCategory.toLowerCase()} for your extraordinary events.`
                                : searchQuery
                                    ? `Search results for "${searchQuery}" in our luxury rental collection.`
                                    : "Browse our exclusive categories of luxury event rentals, designed to transform any venue."
                            }
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Enhanced Sticky Search & Filter Bar */}
            <div className="sticky top-0 z-40 bg-[#FDFBF7]/80 backdrop-blur-xl border-b border-border/10">
                <div className="container mx-auto px-4 md:px-6 py-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                            <Input
                                placeholder="Search the collection..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-11 pr-4 h-12 border-border/20 focus:border-gold/30 rounded-full bg-white/50 transition-all duration-300 focus:bg-white shadow-sm font-light"
                            />
                        </div>

                        {/* Filters and Controls */}
                        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                            {/* Category Navigation */}
                            {selectedCategory && (
                                <Button
                                    variant="ghost"
                                    onClick={handleBackToCatalog}
                                    className="flex gap-2 rounded-full hover:bg-gold/10 hover:text-gold transition-colors font-medium"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline">All Categories</span>
                                    <span className="sm:hidden">All</span>
                                </Button>
                            )}

                            {/* Sort Dropdown */}
                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="w-44 h-12 rounded-full border-border/20 bg-white/50 font-light shadow-sm">
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
                            <div className="flex items-center gap-1 border border-border/10 rounded-full p-1 bg-white/50 shadow-sm">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "h-10 w-10 rounded-full transition-all duration-300",
                                        viewMode === 'grid' && "bg-gold text-black hover:bg-gold/90 shadow-md"
                                    )}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('masonry')}
                                    className={cn(
                                        "h-10 w-10 rounded-full transition-all duration-300",
                                        viewMode === 'masonry' && "bg-gold text-black hover:bg-gold/90 shadow-md"
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
                                className="lg:hidden h-12 w-12 rounded-full border-border/20 bg-white/50 shadow-sm"
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
                            className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/10"
                        >
                            {selectedCategory && (
                                <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20 px-4 py-1.5 rounded-full font-medium">
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
                                <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20 px-4 py-1.5 rounded-full font-medium">
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
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
                <AnimatePresence mode="wait">
                    {/* Unified Content Layout */}
                    <motion.div
                        key={selectedCategory || 'main'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-16 md:space-y-32"
                    >
                        {/* Results Summary */}
                        {(selectedCategory || searchQuery) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center md:text-left"
                            >
                                <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-foreground tracking-tight">
                                    {selectedCategory ? selectedCategory : 'Search Results'}
                                </h2>
                                <p className="text-muted-foreground/70 text-lg font-light">
                                    {selectedCategory
                                        ? `Discover our premium ${selectedCategory.toLowerCase()} collection`
                                        : `Found ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} for "${searchQuery}"`
                                    }
                                </p>
                                <div className="h-0.5 w-16 bg-gold mx-auto md:mx-0 mt-6 opacity-40" />
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
                                        <div className="mb-16 text-center">
                                            <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4 block opacity-80">
                                                Premium Selection
                                            </span>
                                            <h2 className="text-4xl md:text-6xl font-serif font-light mb-6 text-foreground tracking-tight">
                                                Featured Collection
                                            </h2>
                                            <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto font-light">
                                                Hand-picked premium pieces that define luxury and elegance for extraordinary events.
                                            </p>
                                            <div className="h-0.5 w-20 bg-gold mx-auto mt-8 opacity-40" />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
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
                                        <div className="mb-16 text-center">
                                            <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase mb-4 block opacity-80">
                                                Complete Solutions
                                            </span>
                                            <h2 className="text-4xl md:text-6xl font-serif font-light mb-6 text-foreground tracking-tight">
                                                Curated Packages
                                            </h2>
                                            <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto font-light">
                                                Complete event solutions designed for seamless planning and execution.
                                            </p>
                                            <div className="h-0.5 w-20 bg-gold mx-auto mt-8 opacity-40" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                                            {featuredPackages.slice(0, 3).map((pkg, index) => (
                                                <motion.div
                                                    key={pkg.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.6, delay: index * 0.15 }}
                                                >
                                                    <DealCard
                                                        name={pkg.name}
                                                        description={pkg.description}
                                                        price={pkg.price}
                                                        imageUrl={pkg.image_url}
                                                        onViewDetails={() => router.push(`/packages/${pkg.id}`)}
                                                        dealBadge="PACKAGE"
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.section>
                                )}
                            </>
                        )}

                        {/* Default Category Browse View */}
                        {!selectedCategory && !searchQuery && (
                            <>
                                {/* Desktop Category Grid */}
                                <div className="hidden lg:block">
                                    <div className="mb-12">
                                        <h2 className="text-3xl md:text-4xl font-serif font-light mb-12 text-foreground tracking-tight">
                                            Browse Categories
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                                        {orderedCategories.map((category, index) => (
                                            <motion.div
                                                key={category.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
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

                                {/* Mobile Category Navigation */}
                                <div className="lg:hidden">
                                    <div className="mb-8">
                                        <h2 className="text-2xl md:text-3xl font-serif font-light mb-8 text-foreground tracking-tight">
                                            Browse Categories
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {orderedCategories.slice(0, 6).map((category, index) => (
                                            <motion.div
                                                key={category.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
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
                                        <div className="mt-10 text-center">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsSidebarOpen(true)}
                                                className="rounded-full border-border/20 px-8 py-6 text-base font-light hover:bg-gold hover:text-black transition-all duration-300"
                                            >
                                                View All Categories ({orderedCategories.length})
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Products Grid/Masonry with Sidebar */}
                        {(selectedCategory || searchQuery) && (
                            <div className="flex gap-12">
                                {/* Category Sidebar */}
                                <aside className="hidden lg:block w-72 flex-shrink-0">
                                    <div className="sticky top-40 space-y-8">
                                        <h3 className="text-xl font-serif font-light text-foreground mb-6 tracking-tight">
                                            Browse Collections
                                        </h3>
                                        <nav className="space-y-1">
                                            <button
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm font-light",
                                                    !selectedCategory
                                                        ? "bg-gold text-black font-medium shadow-lg shadow-gold/20"
                                                        : "hover:bg-white hover:shadow-sm text-muted-foreground hover:text-foreground"
                                                )}
                                                onClick={handleBackToCatalog}
                                            >
                                                All Collections
                                            </button>
                                            {orderedCategories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm font-light",
                                                        selectedCategory === category.name
                                                            ? "bg-gold text-black font-medium shadow-lg shadow-gold/20"
                                                            : "hover:bg-white hover:shadow-sm text-muted-foreground hover:text-foreground"
                                                    )}
                                                    onClick={() => handleCategoryClick(category.name)}
                                                >
                                                    {category.name}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>
                                </aside>

                                {/* Products Grid */}
                                <div className="flex-1">
                                    {filteredProducts.length > 0 ? (
                                        <motion.div
                                            layout
                                            className={cn(
                                                "transition-all duration-500",
                                                viewMode === 'grid'
                                                    ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-10"
                                                    : "columns-2 sm:columns-2 lg:columns-3 xl:columns-3 gap-6 md:gap-10 space-y-6 md:space-y-10"
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
                                                        delay: Math.min(index * 0.03, 0.2),
                                                        layout: { duration: 0.3 }
                                                    }}
                                                    className={cn(
                                                        viewMode === 'masonry' && "break-inside-avoid mb-6 md:mb-10",
                                                        "w-full"
                                                    )}
                                                >
                                                    <ProductCard product={product} />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center py-32 md:py-48 bg-white/40 rounded-3xl border border-border/10"
                                        >
                                            <div className="max-w-md mx-auto">
                                                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                                    <Search className="h-10 w-10 text-gold" />
                                                </div>
                                                <h3 className="text-2xl md:text-3xl font-serif font-light mb-4 text-foreground tracking-tight">
                                                    No products found
                                                </h3>
                                                <p className="text-muted-foreground/70 mb-10 font-light">
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
                                                        className="rounded-full border-border/20 px-8 py-6 font-light hover:bg-gold hover:text-black transition-all duration-300"
                                                    >
                                                        Browse All Collections
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}


                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile Category Drawer */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="w-80 p-0 sm:w-96 bg-[#FDFBF7] border-r-border/10">
                    <SheetHeader className="p-8 pb-6 border-b border-border/10">
                        <SheetTitle className="text-2xl font-serif font-light flex items-center gap-3">
                            <Menu className="h-6 w-6 text-gold" />
                            Collections
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground/70 mt-2 font-light">
                            Explore our premium rental catalog
                        </p>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto">
                        <nav className="px-6 py-6">
                            <div className="space-y-2">
                                {/* All Categories Option */}
                                <button
                                    className={cn(
                                        "w-full text-left px-5 py-5 rounded-2xl transition-all duration-300 border border-transparent",
                                        !selectedCategory && !searchQuery
                                            ? "bg-gold text-black shadow-lg shadow-gold/20"
                                            : "hover:bg-white hover:border-border/10 text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => {
                                        handleBackToCatalog()
                                        setIsSidebarOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                                            !selectedCategory && !searchQuery ? "bg-black/10" : "bg-gold/10"
                                        )}>
                                            <LayoutGrid className={cn("h-6 w-6", !selectedCategory && !searchQuery ? "text-black" : "text-gold")} />
                                        </div>
                                        <div>
                                            <span className="font-medium block">All Collections</span>
                                            <span className="text-xs opacity-70 font-light">Browse everything</span>
                                        </div>
                                    </div>
                                </button>

                                {/* Category List */}
                                {orderedCategories.map(category => (
                                    <button
                                        key={category.id}
                                        className={cn(
                                            "w-full text-left px-5 py-5 rounded-2xl transition-all duration-300 border border-transparent",
                                            selectedCategory === category.name
                                                ? "bg-gold text-black shadow-lg shadow-gold/20"
                                                : "hover:bg-white hover:border-border/10 text-muted-foreground hover:text-foreground"
                                        )}
                                        onClick={() => {
                                            handleCategoryClick(category.name)
                                            setIsSidebarOpen(false)
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            {category.image_url ? (
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                                                    <Image
                                                        src={category.image_url}
                                                        alt=""
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                                                    <LayoutGrid className="h-5 w-5 opacity-30" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium block truncate">{category.name}</span>
                                                <span className="text-xs opacity-70 font-light">Premium pieces</span>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-40 flex-shrink-0" />
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
