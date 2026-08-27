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
import { resolvePriceCents } from "@/lib/catalog/adapters"

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
    categories?: { name: string, slug?: string } | { name: string, slug?: string }[] | null
    slug?: string
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
                setResults(data as { products: Product[]; categories: Category[] })
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
                            className="w-full max-w-2xl bg-[#1A1A1A] border border-white/5 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto flex flex-col max-h-[80vh] relative"
                        >
                            <div className="absolute inset-0 bg-[url('/images/luxury-texture.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

                            <div className="flex items-center p-6 border-b border-white/5 bg-white/5 backdrop-blur-xl relative z-10">
                                <Search className="w-5 h-5 text-gold/40 mr-4" />
                                <Input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search the collection..."
                                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-xl font-light bg-transparent h-auto p-0 text-white placeholder:text-gray-600"
                                />
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full transition-all duration-300 ml-2 group"
                                >
                                    <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 relative z-10 custom-scrollbar">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="w-10 h-10 animate-spin text-gold" />
                                        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/40 font-bold">Consulting the archives</p>
                                    </div>
                                ) : (results.products.length > 0 || results.categories.length > 0) ? (
                                    <div className="grid gap-8">
                                        {/* Category Results */}
                                        {results.categories.length > 0 && (
                                            <div>
                                                <h3 className="text-[10px] font-bold text-gold/40 mb-4 uppercase tracking-[0.4em]">Collections</h3>
                                                <div className="grid gap-3">
                                                    {results.categories.map((category) => (
                                                        <Link
                                                            key={category.id}
                                                            href={`/catalog?category=${encodeURIComponent(category.name)}`}
                                                            onClick={onClose}
                                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-500 group"
                                                        >
                                                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-all duration-500">
                                                                <Search className="w-4 h-4" />
                                                            </div>
                                                            <span className="font-serif text-lg text-white font-light group-hover:translate-x-1 transition-transform">
                                                                Explore <span className="italic text-gold">{category.name}</span>
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Product Results */}
                                        {results.products.length > 0 && (
                                            <div>
                                                <h3 className="text-[10px] font-bold text-gold/40 mb-4 uppercase tracking-[0.4em]">Masterpieces</h3>
                                                <div className="grid gap-4">
                                                    {results.products.map((product) => (
                                                        <Link
                                                            key={product.id}
                                                            href={`/catalog/${(Array.isArray(product.categories) ? product.categories[0]?.slug : product.categories?.slug) || "uncategorized"}/${product.slug || product.id}`}
                                                            onClick={onClose}
                                                            className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-500 group"
                                                        >
                                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/5">
                                                                {product.image_url ? (
                                                                    <Image
                                                                        src={product.image_url}
                                                                        alt={product.name}
                                                                        fill
                                                                        className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                                        <Search className="w-6 h-6" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 py-1">
                                                                <h4 className="font-serif text-lg text-white font-light group-hover:text-gold transition-colors truncate mb-1">
                                                                    {product.name}
                                                                </h4>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                                                                        {(Array.isArray(product.categories) ? product.categories[0]?.name : product.categories?.name) || "Curated"}
                                                                    </span>
                                                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                                                    <span className="text-sm font-serif text-gold">
                                                                        {formatCurrency(resolvePriceCents(product))}
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
                                    <div className="text-center py-20 flex flex-col items-center gap-6">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                            <Search className="w-8 h-8 text-gold/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-white font-serif text-xl font-light">The search continues</p>
                                            <p className="text-sm text-gray-500 font-light">No results found for "{query}"</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 flex flex-col items-center gap-6">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                            <Search className="w-8 h-8 text-gold/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-white font-serif text-xl font-light">Discovery Awaits</p>
                                            <p className="text-sm text-gray-500 font-light">Begin typing to browse our curated collection.</p>
                                        </div>
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
