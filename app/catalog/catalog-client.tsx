"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, Plus, Grid3x3, List, ArrowUpDown, Calendar, Package, Eye } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { CatalogSearch } from "@/components/catalog-search"
import { CatalogFilters } from "@/components/catalog-filters"
import { ProductQuickView } from "@/components/product-quick-view"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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
    categories?: { name: string }
    quantity_available?: number
    features?: string[]
    sku?: string
}

interface CatalogClientProps {
    heroTitle: string
    products: Product[]
    categories: string[]
}

type ViewMode = "grid" | "list"
type SortOption = "newest" | "price-low" | "price-high" | "name"

interface FilterOptions {
    categories: string[]
    priceRange: [number, number]
    features: string[]
    availability: boolean
}

export default function CatalogClient({ heroTitle, products, categories }: CatalogClientProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<ViewMode>("grid")
    const [sortBy, setSortBy] = useState<SortOption>("newest")
    const [filters, setFilters] = useState<FilterOptions>({
        categories: [],
        priceRange: [0, 1000],
        features: [],
        availability: false
    })
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

    const { items, addItem, removeItem } = useCart()

    // Calculate max price for filter
    const maxPrice = useMemo(() => {
        return Math.max(...products.map(p => p.rental_price_daily || p.price || 0), 1000)
    }, [products])

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...products]

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.categories?.name.toLowerCase().includes(query) ||
                p.sku?.toLowerCase().includes(query)
            )
        }

        // Category filter
        if (filters.categories.length > 0) {
            result = result.filter(p =>
                filters.categories.includes(p.categories?.name || "")
            )
        }

        // Price filter
        const [minPrice, maxPrice] = filters.priceRange
        result = result.filter(p => {
            const price = p.rental_price_daily || p.price
            return price >= minPrice && price <= maxPrice
        })

        // Features filter
        if (filters.features.length > 0) {
            result = result.filter(p =>
                filters.features.some(f => p.features?.includes(f))
            )
        }

        // Availability filter
        if (filters.availability) {
            result = result.filter(p => (p.quantity_available || 0) > 0)
        }

        // Sort
        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => (a.rental_price_daily || a.price) - (b.rental_price_daily || b.price))
                break
            case "price-high":
                result.sort((a, b) => (b.rental_price_daily || b.price) - (a.rental_price_daily || a.price))
                break
            case "name":
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            case "newest":
            default:
                // Already in newest order from query
                break
        }

        return result
    }, [products, searchQuery, filters, sortBy])

    const isInCart = (id: string) => items.some((item) => item.productId === id)

    const toggleCart = (id: string) => {
        if (isInCart(id)) {
            removeItem(id)
        } else {
            addItem(id)
        }
    }

    const getAvailabilityBadge = (quantity?: number) => {
        if (!quantity || quantity === 0) {
            return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
        }
        if (quantity <= 5) {
            return <Badge variant="secondary" className="text-xs">Low Stock</Badge>
        }
        return <Badge variant="outline" className="text-xs">Available</Badge>
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
            <div className="py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6">
                    {/* Header */}
                    <div className="flex flex-col gap-6 mb-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-serif mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {heroTitle}
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                                </p>
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <CatalogSearch onSearch={setSearchQuery} />

                            <div className="flex gap-2 items-center w-full sm:w-auto">
                                <CatalogFilters
                                    categories={categories}
                                    onFilterChange={setFilters}
                                    maxPrice={maxPrice}
                                />

                                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                                    <SelectTrigger className="w-[180px]">
                                        <ArrowUpDown className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                                        <SelectItem value="name">Name: A to Z</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid/List */}
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No products found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="group flex flex-col animate-fade-in-up hover:scale-[1.02] transition-transform duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4 rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                                        <Link href={`/catalog/${product.id}`}>
                                            <Image
                                                src={product.image_url || "/placeholder.svg"}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </Link>

                                        {/* Availability Badge */}
                                        <div className="absolute top-4 left-4">
                                            {getAvailabilityBadge(product.quantity_available)}
                                        </div>

                                        {/* Quick View Button */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setQuickViewProduct(product)
                                                setIsQuickViewOpen(true)
                                            }}
                                            className="absolute bottom-4 left-4 h-12 w-12 rounded-full bg-background/95 backdrop-blur flex items-center justify-center shadow-lg hover:bg-background transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                                        >
                                            <Eye className="h-5 w-5" />
                                            <span className="sr-only">Quick view</span>
                                        </button>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                toggleCart(product.id)
                                            }}
                                            className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-background/95 backdrop-blur flex items-center justify-center shadow-lg hover:bg-background transition-all duration-300 hover:scale-110 z-10"
                                        >
                                            {isInCart(product.id) ? (
                                                <Check className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Plus className="h-5 w-5" />
                                            )}
                                            <span className="sr-only">Add to quote</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1">
                                                <Link href={`/catalog/${product.id}`}>
                                                    <h3 className="font-serif text-lg hover:underline decoration-1 underline-offset-4 line-clamp-2">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    {product.categories?.name || 'Uncategorized'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className="font-semibold text-lg">
                                                ${(product.rental_price_daily || product.price).toFixed(2)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">/ day</span>
                                        </div>

                                        {product.features && product.features.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {product.features.slice(0, 2).map((feature, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                                {product.features.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{product.features.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="group flex flex-col sm:flex-row gap-6 p-6 bg-card rounded-lg shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <div className="relative w-full sm:w-48 aspect-[4/3] sm:aspect-square overflow-hidden bg-secondary rounded-lg flex-shrink-0">
                                        <Link href={`/catalog/${product.id}`}>
                                            <Image
                                                src={product.image_url || "/placeholder.svg"}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </Link>
                                        <div className="absolute top-2 left-2">
                                            {getAvailabilityBadge(product.quantity_available)}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <div>
                                                    <Link href={`/catalog/${product.id}`}>
                                                        <h3 className="font-serif text-2xl hover:underline decoration-1 underline-offset-4">
                                                            {product.name}
                                                        </h3>
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground">
                                                        {product.categories?.name || 'Uncategorized'}
                                                        {product.sku && ` • SKU: ${product.sku}`}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-2xl">
                                                        ${(product.rental_price_daily || product.price).toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">per day</div>
                                                </div>
                                            </div>

                                            <p className="text-muted-foreground line-clamp-2 mb-3">
                                                {product.description}
                                            </p>

                                            {product.features && product.features.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {product.features.map((feature, idx) => (
                                                        <Badge key={idx} variant="secondary">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant={isInCart(product.id) ? "outline" : "default"}
                                                onClick={() => toggleCart(product.id)}
                                                className="gap-2"
                                            >
                                                {isInCart(product.id) ? (
                                                    <>
                                                        <Check className="h-4 w-4" /> Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4" /> Add to Quote
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href={`/catalog/${product.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick View Modal */}
            <ProductQuickView
                product={quickViewProduct}
                open={isQuickViewOpen}
                onOpenChange={setIsQuickViewOpen}
                onAddToCart={toggleCart}
                isInCart={quickViewProduct ? isInCart(quickViewProduct.id) : false}
            />
        </div>
    )
}
