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
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section - More Compact */}
            <section className="relative py-12 px-4 text-center bg-background border-b border-border/50">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-gold animate-fade-in">
                        {selectedCategory ? selectedCategory : (heroTitle || "Rental Catalog")}
                    </h1>
                    <p className="text-muted-foreground text-base mb-8 max-w-2xl mx-auto">
                        {selectedCategory
                            ? `Browse our collection of ${selectedCategory.toLowerCase()}.`
                            : "Explore our premium collection of event rentals, packages, and exclusive deals."
                        }
                    </p>

                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search for products, categories, or packages..."
                    />
                </div>
            </section>

            <div className="container mx-auto px-4">
                {/* If a category is selected, show products in that category */}
                {selectedCategory ? (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <Button
                                variant="ghost"
                                onClick={handleBackToCatalog}
                                className="hover:text-gold transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Catalog
                            </Button>

                            <div className="flex items-center gap-2 border rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                    className="h-8 w-8"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className={cn(
                            "grid gap-4 md:gap-6",
                            viewMode === 'grid'
                                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                : "grid-cols-1"
                        )}>
                            {filteredProducts.map((product) => (
                                viewMode === 'grid' ? (
                                    <ProductCard key={product.id} product={product} />
                                ) : (
                                    <div key={product.id} className="flex gap-6 border rounded-xl p-4 hover:border-gold/50 transition-colors">
                                        <div className="relative w-48 aspect-[4/3] flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
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
                                )
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-muted-foreground text-lg">No products found in this category.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Main Catalog View
                    <div className="space-y-10">

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

                        {/* Categories Grid - More Compact */}
                        <section>
                            <h2 className="text-2xl font-serif font-bold mb-4">Browse by Category</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredCategories.map((category) => (
                                    <CategoryCard
                                        key={category.id}
                                        name={category.name}
                                        imageUrl={category.image_url}
                                        onClick={() => handleCategoryClick(category.name)}
                                    />
                                ))}
                            </div>

                            {filteredCategories.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No categories found matching your search.</p>
                                </div>
                            )}
                        </section>

                        {/* All Products (if searching) */}
                        {searchQuery && (
                            <section>
                                <h2 className="text-2xl font-serif font-bold mb-4">Products</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
