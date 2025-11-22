'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/product-card'
import { SearchBar } from '@/components/catalog/search-bar'
import { CategoryCard } from '@/components/catalog/category-card'
import { PackageCard } from '@/components/catalog/package-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    category_id: string | null
    categories?: { name: string } | null
    is_featured?: boolean
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
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
        setSelectedCategory(categoryName)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleBackToCatalog = () => {
        setSelectedCategory(null)
        setSearchQuery('')
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <section className="relative py-20 px-4 text-center bg-gradient-to-b from-background to-background/50 border-b border-border/50">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gold to-white animate-gradient-x">
                        {selectedCategory ? selectedCategory : (heroTitle || "Rental Catalog")}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
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
                        <Button
                            variant="ghost"
                            onClick={handleBackToCatalog}
                            className="mb-8 hover:text-gold transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Catalog
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
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
                    <div className="space-y-20">

                        {/* Featured Packages / Deals */}
                        {(featuredPackages.length > 0 || featuredProducts.length > 0) && !searchQuery && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-3xl font-serif font-bold">Featured Deals & Packages</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {featuredPackages.map(pkg => (
                                        <PackageCard
                                            key={pkg.id}
                                            name={pkg.name}
                                            description={pkg.description}
                                            price={pkg.price}
                                            imageUrl={pkg.image_url}
                                            onViewDetails={() => console.log('View package', pkg.id)}
                                        />
                                    ))}
                                    {/* Also show featured products here if needed, or in a separate section */}
                                    {featuredProducts.slice(0, 3).map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Categories Grid */}
                        <section>
                            <h2 className="text-3xl font-serif font-bold mb-8">Browse by Category</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <h2 className="text-3xl font-serif font-bold mb-8">Products</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
