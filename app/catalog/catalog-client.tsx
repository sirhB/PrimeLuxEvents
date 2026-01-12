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
    const [inputValue, setInputValue] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('name')
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
                (p.categories?.name?.toLowerCase() || '').includes(query)
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
        params.delete('search')
        setInputValue('')
        setSearchQuery('')
        router.push(`${pathname}?${params.toString()}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleBackToCatalog = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('category')
        params.delete('search')
        setInputValue('')
        setSearchQuery('')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleSearchChange = (value: string) => {
        setInputValue(value)
    }

    // Debounce search updates
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue)

            const params = new URLSearchParams(searchParams.toString())
            const currentSearch = params.get('search') || ''

            if (inputValue.trim() !== currentSearch) {
                if (inputValue.trim()) {
                    params.set('search', inputValue)
                } else {
                    params.delete('search')
                }

                // Use window.history.replaceState instead of router.replace to avoid 
                // triggering a Next.js server request/refresh on every keystroke
                const newUrl = `${pathname}?${params.toString()}`
                window.history.replaceState(null, '', newUrl)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [inputValue, pathname, searchParams])

    // Sync state with URL only on mount or external navigation (like back button)
    useEffect(() => {
        const searchParam = searchParams.get('search') || ''
        // Only update if the URL param is different from what we have
        // This check prevents overwriting our local state when we manually update history
        if (searchParam !== inputValue && searchParam !== searchQuery) {
            setInputValue(searchParam)
            setSearchQuery(searchParam)
        }
    }, [searchParams])

    return (
        <main className="min-h-screen bg-[#1A1A1A] text-white selection:bg-gold selection:text-black">
            {/* Background Texture Overlays */}
            <div className="fixed inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay pointer-events-none z-0" />

            {/* Immersive Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-black">
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src={selectedCategory
                            ? (categories.find(c => c.name === selectedCategory)?.image_url || "/images/luxury-event-hero.png")
                            : "/images/luxury-event-hero.png"
                        }
                        alt="Catalog Hero"
                        fill
                        className="object-cover opacity-40 scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#1A1A1A]" />
                </motion.div>

                <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4 md:px-6 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl space-y-10"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <span className="w-12 h-px bg-gold/30" />
                            <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Curated Intelligence</span>
                            <span className="w-12 h-px bg-gold/30" />
                        </div>

                        <h1 className="text-6xl md:text-9xl font-serif font-light tracking-tighter leading-[0.85] text-white">
                            {selectedCategory
                                ? selectedCategory
                                : searchQuery
                                    ? `Search`
                                    : (heroTitle || "The Collection")
                            }
                        </h1>

                        <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                            {selectedCategory
                                ? `Curated selection of premium ${selectedCategory.toLowerCase()} for your extraordinary events.`
                                : searchQuery
                                    ? `Results for "${searchQuery}" in our luxury rental collection.`
                                    : "Browse our exclusive categories of luxury event rentals, designed to transform any venue."
                            }
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Sticky Search & Filter Bar */}
            <div className="sticky top-[72px] z-40 bg-[#1A1A1A]/80 backdrop-blur-xl border-y border-white/5 transition-all duration-300" style={{ top: 'var(--header-height, 72px)' }}>
                <div className="container mx-auto px-4 md:px-6 py-6 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gold/40" />
                            <Input
                                placeholder="Search markers..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-14 pr-6 h-14 border-white/5 focus:border-gold/30 rounded-full bg-white/5 transition-all duration-300 focus:bg-white/10 text-white placeholder:text-gray-600 font-light shadow-2xl"
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                            {selectedCategory && (
                                <Button
                                    variant="ghost"
                                    onClick={handleBackToCatalog}
                                    className="flex gap-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-gold transition-colors font-bold uppercase tracking-widest text-[10px]"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    All Collections
                                </Button>
                            )}

                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="w-44 h-14 rounded-full border-white/5 bg-white/5 text-white font-light shadow-2xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1E1E1E] border-white/10 text-white">
                                    <SelectItem value="name">Name A-Z</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-full p-1 shadow-2xl">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "h-12 w-12 rounded-full transition-all duration-500",
                                        viewMode === 'grid' ? "bg-gold text-black hover:bg-white shadow-xl" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <Grid3X3 className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode('masonry')}
                                    className={cn(
                                        "h-12 w-12 rounded-full transition-all duration-500",
                                        viewMode === 'masonry' ? "bg-gold text-black hover:bg-white shadow-xl" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    <Columns className="h-5 w-5" />
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden h-14 w-14 rounded-full border border-white/5 bg-white/5 shadow-2xl text-gold"
                            >
                                <SlidersHorizontal className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 md:px-6 py-24 relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory || 'main'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-32"
                    >
                        {/* Featured (only on main catalog) */}
                        {!selectedCategory && !searchQuery && (
                            <>
                                {featuredProducts.length > 0 && (
                                    <section>
                                        <div className="mb-16">
                                            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Premium Selection</span>
                                            <h2 className="text-4xl md:text-7xl font-serif font-light text-white tracking-tighter">Featured Collection</h2>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
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
                                    </section>
                                )}

                                {featuredPackages.length > 0 && (
                                    <section>
                                        <div className="mb-16">
                                            <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Complete Solutions</span>
                                            <h2 className="text-4xl md:text-7xl font-serif font-light text-white tracking-tighter">Curated Packages</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
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
                                    </section>
                                )}
                            </>
                        )}

                        {/* Browse Categories */}
                        {!selectedCategory && !searchQuery && (
                            <section>
                                <div className="mb-16">
                                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">The Collections</span>
                                    <h2 className="text-4xl md:text-7xl font-serif font-light text-white tracking-tighter">Browse Categories</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                                    {orderedCategories.map((category, index) => (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
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
                            </section>
                        )}

                        {/* Products Results List */}
                        {(selectedCategory || searchQuery) && (
                            <div className="flex flex-col lg:flex-row gap-16">
                                {/* Desktop Sidebar */}
                                <aside className="hidden lg:block w-72 flex-shrink-0">
                                    <div className="sticky top-48 space-y-12">
                                        <div className="space-y-6">
                                            <h3 className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">Collections</h3>
                                            <nav className="flex flex-col gap-2">
                                                <button
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm",
                                                        !selectedCategory
                                                            ? "bg-gold text-black font-bold tracking-widest uppercase text-[10px]"
                                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                    onClick={handleBackToCatalog}
                                                >
                                                    All Collections
                                                </button>
                                                {orderedCategories.map((category) => (
                                                    <button
                                                        key={category.id}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm",
                                                            selectedCategory === category.name
                                                                ? "bg-gold text-black font-bold tracking-widest uppercase text-[10px]"
                                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                                        )}
                                                        onClick={() => handleCategoryClick(category.name)}
                                                    >
                                                        {category.name}
                                                    </button>
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                </aside>

                                {/* Grid */}
                                <div className="flex-1">
                                    {filteredProducts.length > 0 ? (
                                        <motion.div
                                            layout
                                            className={cn(
                                                "transition-all duration-500",
                                                viewMode === 'grid'
                                                    ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
                                                    : "columns-2 md:columns-3 gap-6 md:gap-10 space-y-6 md:space-y-10"
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
                                                    className={cn(viewMode === 'masonry' && "break-inside-avoid")}
                                                >
                                                    <ProductCard product={product} />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-40 bg-white/5 rounded-[2.5rem] border border-white/5">
                                            <Search className="h-16 w-16 text-gold/20 mx-auto mb-8" />
                                            <h3 className="text-2xl font-serif text-white mb-4">No Masterpieces Found</h3>
                                            <p className="text-gray-500 font-light mb-12">We couldn't find any products matching your selection.</p>
                                            <Button
                                                onClick={handleBackToCatalog}
                                                className="bg-gold text-black px-12 py-6 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all duration-500"
                                            >
                                                Return to Gallery
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile Category Drawer */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetContent side="left" className="w-80 p-0 bg-[#1A1A1A] border-r border-white/5 text-white">
                    <div className="p-8 border-b border-white/5">
                        <SheetTitle className="text-2xl font-serif font-light text-white">Collections</SheetTitle>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <nav className="flex flex-col gap-2">
                            <button
                                className={cn(
                                    "w-full text-left px-6 py-5 rounded-2xl transition-all duration-300",
                                    !selectedCategory && !searchQuery
                                        ? "bg-gold text-black font-bold uppercase tracking-widest text-[10px]"
                                        : "text-gray-400 hover:text-white"
                                )}
                                onClick={() => {
                                    handleBackToCatalog()
                                    setIsSidebarOpen(false)
                                }}
                            >
                                All Collections
                            </button>
                            {orderedCategories.map(category => (
                                <button
                                    key={category.id}
                                    className={cn(
                                        "w-full text-left px-6 py-5 rounded-2xl transition-all duration-300",
                                        selectedCategory === category.name
                                            ? "bg-gold text-black font-bold uppercase tracking-widest text-[10px]"
                                            : "text-gray-400 hover:text-white"
                                    )}
                                    onClick={() => {
                                        handleCategoryClick(category.name)
                                        setIsSidebarOpen(false)
                                    }}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </main>
    )
}
