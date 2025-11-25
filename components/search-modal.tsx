"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchProducts } from "@/app/actions/search-actions"
import { useDebounce } from "@/lib/hooks/use-debounce"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

interface Product {
    id: string
    name: string
    description: string | null
    price: number
    rental_price_daily?: number
    image_url: string | null
    categories?: { name: string } | { name: string }[] | null
}

interface Category {
    id: string
    name: string
    image_url?: string | null
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<{ products: Product[], categories: Category[] }>({ products: [], categories: [] })
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Debounce search to avoid too many requests
    const [debouncedQuery, setDebouncedQuery] = useState(query)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.length < 2) {
                setResults({ products: [], categories: [] })
                return
            }

            setIsLoading(true)
            try {
                const data = await searchProducts(debouncedQuery)
                setResults(data)
            } catch (error) {
                console.error("Error fetching search results:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchResults()
    }, [debouncedQuery])

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-20 px-4 pointer-events-none">
                        <motion.div
                            layoutId="search-container"
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{
                                type: "spring",
                                damping: 20,
                                stiffness: 300,
                                duration: 0.3
                            }}
                            className="w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]"
                        >
                            <div className="flex items-center p-4 border-b border-border">
                                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                                <Input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for products, categories..."
                                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg bg-transparent h-auto p-0"
                                />
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-muted rounded-full transition-colors ml-2"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-4">
                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                    </div>
                                ) : (results.products.length > 0 || results.categories.length > 0) ? (
                                    <div className="grid gap-4">
                                        {/* Category Results */}
                                        {results.categories.length > 0 && (
                                            <div className="mb-4">
                                                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Categories</h3>
                                                <div className="grid gap-2">
                                                    {results.categories.map((category) => (
                                                        <Link
                                                            key={category.id}
                                                            href={`/catalog?category=${encodeURIComponent(category.name)}`}
                                                            onClick={onClose}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                                        >
                                                            <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-gold">
                                                                <Search className="w-5 h-5" />
                                                            </div>
                                                            <span className="font-medium text-foreground group-hover:text-gold transition-colors">
                                                                View all in "{category.name}"
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Product Results */}
                                        {results.products.length > 0 && (
                                            <div>
                                                {results.categories.length > 0 && (
                                                    <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Products</h3>
                                                )}
                                                <div className="grid gap-4">
                                                    {results.products.map((product) => (
                                                        <Link
                                                            key={product.id}
                                                            href={`/catalog/${product.id}`}
                                                            onClick={onClose}
                                                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                                        >
                                                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                                                                {product.image_url ? (
                                                                    <Image
                                                                        src={product.image_url}
                                                                        alt={product.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs">
                                                                        No Img
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-foreground group-hover:text-gold transition-colors truncate">
                                                                    {product.name}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                                    {product.description}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                                        {(Array.isArray(product.categories) ? product.categories[0]?.name : product.categories?.name) || "Uncategorized"}
                                                                    </span>
                                                                    <span className="text-sm font-semibold text-gold">
                                                                        {formatCurrency(product.rental_price_daily || product.price)}
                                                                        <span className="text-xs text-muted-foreground font-normal">/day</span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : query.length >= 2 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No results found for "{query}"
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Start typing to search our catalog...
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
