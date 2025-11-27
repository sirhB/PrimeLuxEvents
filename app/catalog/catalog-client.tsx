'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { SearchBar } from '@/components/catalog/search-bar'
import { CategoryCard } from '@/components/catalog/category-card'
import { FeaturedProductCard } from '@/components/catalog/featured-product-card'
import { DealCard } from '@/components/catalog/deal-card'
import { CarouselSection } from '@/components/catalog/carousel-section'
import { Button } from '@/components/ui/button'
import { ArrowLeft, LayoutGrid, List, Filter, X, Menu } from 'lucide-react'
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

    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const selectedCategory = searchParams.get('category')

    // Parallax effect for hero
    const heroY = useTransform(scrollY, [0, 500], [0, 200])
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

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

    // Featured first then alphabetically
    const orderedCategories = useMemo(() => {
        const featured = categories.filter(c => c.is_featured).sort((a, b) => a.name.localeCompare(b.name))
        const nonFeatured = categories.filter(c => !c.is_featured).sort((a, b) => a.name.localeCompare(b.name))
        return [...featured, ...nonFeatured]
    }, [categories])

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return orderedCategories
        const query = searchQuery.toLowerCase()
        return orderedCategories.filter(c => c.name.toLowerCase().includes(query))
    }, [orderedCategories, searchQuery])

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

            {/* Sticky Search & Filter Bar */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 transition-all duration-300">
                <div className="container mx-auto px-4 md:px-6 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="w-full md:w-auto flex-1 max-w-xl">
                            <div className="relative">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search our collection..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            {selectedCategory && (
                                <Button
                                    variant="outline"
                                    onClick={handleBackToCatalog}
                                    className="hidden md:flex gap-2 rounded-full border-border/50 hover:bg-secondary hover:text-foreground"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    All Categories
                                </Button>
                            )}

                            <div className="flex items-center gap-1 border border-border/50 rounded-full p-1 bg-background/50">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "h-8 w-8 rounded-full transition-all duration-300",
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
                                        "h-8 w-8 rounded-full transition-all duration-300",
                                        viewMode === 'list' && "bg-gold text-black hover:bg-gold/90"
                                    )}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <AnimatePresence mode="wait">
                    {/* Category sidebar + grid layout for selected category */}
                    {selectedCategory ? (
                        <div className="flex flex-col md:flex-row gap-0 md:gap-8">
                            {/* Sidebar (desktop only) */}
                            <aside className="hidden md:block w-64 flex-shrink-0 border-r border-border/10 bg-background/90">
                                <div className="sticky top-24">
                                    <div className="pb-6 pt-2 pl-2 text-base font-bold text-foreground tracking-wide">Categories</div>
                                    <nav className="flex flex-col gap-2">
                                        {orderedCategories.map(category => (
                                            <button
                                                key={category.id}
                                                className={cn(
                                                    "text-left px-4 py-2 rounded transition-colors",
                                                    selectedCategory === category.name ? "bg-gold/10 text-gold font-bold border border-gold" : "hover:bg-secondary/20"
                                                )}
                                                onClick={() => handleCategoryClick(category.name)}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </aside>
                            {/* Drawer (mobile only) */}
                            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                                <SheetTrigger asChild>
                                    <button
                                        className="md:hidden flex items-center gap-2 mb-6 mt-1 text-gold px-2 sticky top-20 z-20"
                                        onClick={() => setIsSidebarOpen(true)}
                                    >
                                        <Menu className="h-6 w-6" />
                                        Categories
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-64 p-0">
                                    <SheetHeader>
                                        <SheetTitle className="p-4 pb-0 text-lg">Categories</SheetTitle>
                                    </SheetHeader>
                                    <nav className="flex flex-col gap-1 p-4">
                                        {orderedCategories.map(category => (
                                            <button
                                                key={category.id}
                                                className={cn(
                                                    "text-left px-4 py-2 rounded",
                                                    selectedCategory === category.name ? "bg-gold/10 text-gold font-bold border border-gold" : "hover:bg-secondary/20"
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
                                </SheetContent>
                            </Sheet>
                            {/* Main grid/content */}
                            <div className="flex-1 px-1 md:px-0">
                                <div className={cn(
                                    "grid gap-6 md:gap-8",
                                    viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
                                )}>
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
                                            <motion.div key={product.id} />
                                        )
                                    ))}
                                </div>
                                {filteredProducts.length === 0 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                        <p className="text-muted-foreground text-lg">No products found in this category.</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            key="main-catalog"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-20 md:space-y-32"
                        >
                            {/* Featured Products Carousel */}
                            {featuredProducts.length > 0 && !searchQuery && (
                                <CarouselSection
                                    title="Featured Collection"
                                    subtitle="Hand-picked premium pieces that define luxury and elegance"
                                >
                                    {featuredProducts.map(product => (
                                        <div key={product.id} className="flex-[0_0_85%] md:flex-[0_0_40%] lg:flex-[0_0_30%] min-w-0 pl-4 first:pl-0">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </CarouselSection>
                            )}

                            {/* Categories Grid */}
                            <section>
                                <div className="mb-12 text-center md:text-left">
                                    <span className="text-gold text-xs font-medium tracking-widest uppercase mb-3 block">
                                        Explore Collections
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-serif mb-4 text-foreground">
                                        Browse by Category
                                    </h2>
                                    <div className="h-1 w-20 bg-gold mx-auto md:mx-0" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCategories.map((category, index) => (
                                        <motion.div
                                            key={category.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-50px" }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
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
                            </section>

                            {/* Deals & Packages Carousel */}
                            {featuredPackages.length > 0 && !searchQuery && (
                                <CarouselSection
                                    title="Curated Packages"
                                    subtitle="Complete event solutions for seamless planning"
                                    autoPlay={true}
                                    autoPlayInterval={6000}
                                >
                                    {featuredPackages.map(pkg => (
                                        <div key={pkg.id} className="flex-[0_0_85%] md:flex-[0_0_55%] lg:flex-[0_0_40%] min-w-0 pl-4 first:pl-0">
                                            <DealCard
                                                name={pkg.name}
                                                description={pkg.description}
                                                price={pkg.price}
                                                imageUrl={pkg.image_url}
                                                onViewDetails={() => console.log('View package', pkg.id)}
                                                dealBadge="PACKAGE"
                                            />
                                        </div>
                                    ))}
                                </CarouselSection>
                            )}

                            {/* All Products (if searching) */}
                            {searchQuery && (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="mb-8 border-b border-border/40 pb-4">
                                        <h2 className="text-2xl md:text-3xl font-serif mb-2">
                                            Search Results
                                        </h2>
                                        <p className="text-muted-foreground">
                                            Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} for "{searchQuery}"
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
