'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/lib/hooks/use-debounce'

export interface SearchResult<T> {
    id: string
    label: string
    subLabel?: string
    value: T
    image?: string | null
    icon?: React.ElementType
}

interface SearchableSelectProps<T> {
    placeholder?: string
    onSearch: (query: string) => Promise<SearchResult<T>[]>
    onSelect: (item: SearchResult<T>) => void
    initialValue?: SearchResult<T> | null
    className?: string
    renderItem?: (item: SearchResult<T>, isSelected: boolean) => React.ReactNode
}

export function SearchableSelect<T>({
    placeholder = "Search...",
    onSearch,
    onSelect,
    initialValue,
    className,
    renderItem
}: SearchableSelectProps<T>) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [results, setResults] = React.useState<SearchResult<T>[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedItem, setSelectedItem] = React.useState<SearchResult<T> | null>(initialValue || null)
    const [activeIndex, setActiveIndex] = React.useState(-1)

    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Debounce search
    const debouncedQuery = useDebounce(query, 300)

    React.useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    React.useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery || debouncedQuery.length < 1) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                const data = await onSearch(debouncedQuery)
                setResults(data)
                setActiveIndex(-1)
            } catch (error) {
                console.error("Search failed:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (isOpen) {
            fetchResults()
        }
    }, [debouncedQuery, isOpen, onSearch])

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                e.preventDefault()
                setIsOpen(true)
            }
            return
        }

        if (e.key === 'Escape') {
            setIsOpen(false)
            inputRef.current?.blur()
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => (prev + 1) % results.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => (prev - 1 + results.length) % results.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeIndex >= 0 && results[activeIndex]) {
                handleSelect(results[activeIndex])
            }
        }
    }

    const handleSelect = (item: SearchResult<T>) => {
        setSelectedItem(item)
        onSelect(item)
        setIsOpen(false)
        setQuery('')
    }

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedItem(null)
        setQuery('')
        // onSelect(null!) // Optional: require nullable handling in parent or just let them reset manually
    }

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {/* Trigger Area */}
            <div
                onClick={() => setIsOpen(true)}
                className={cn(
                    "flex items-center justify-between w-full p-3 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-background)] text-white cursor-pointer transition-all duration-200 hover:border-[var(--dashboard-accent-gold)]/50 hover:bg-[var(--dashboard-card-hover)]",
                    isOpen && "ring-2 ring-[var(--dashboard-accent-gold)]/20 border-[var(--dashboard-accent-gold)]"
                )}
            >
                {selectedItem ? (
                    <div className="flex items-center gap-3 overflow-hidden">
                        {selectedItem.image && (
                            <img src={selectedItem.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                        )}
                        {selectedItem.icon && !selectedItem.image && (
                            <selectedItem.icon className="w-4 h-4 text-[var(--dashboard-accent-gold)]" />
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{selectedItem.label}</span>
                            {selectedItem.subLabel && <span className="text-xs text-muted-foreground truncate">{selectedItem.subLabel}</span>}
                        </div>
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground">{placeholder}</span>
                )}

                <div className="flex items-center gap-2">
                    {selectedItem ? (
                        <button onClick={clearSelection} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-4 h-4 text-muted-foreground hover:text-white" />
                        </button>
                    ) : (
                        <Search className="w-4 h-4 text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 z-[999] bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl shadow-2xl overflow-hidden"
                    >
                        {/* Search Input inside dropdown */}
                        <div className="p-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type to search..."
                                    className="w-full bg-[var(--dashboard-background)] border border-[var(--dashboard-border)] rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-[var(--dashboard-accent-gold)] focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/20 transition-all"
                                />
                                {isLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-[var(--dashboard-accent-gold)]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                            {results.length > 0 ? (
                                <ul className="space-y-1">
                                    {results.map((item, idx) => (
                                        <li
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                                                activeIndex === idx ? "bg-[var(--dashboard-accent-gold)]/10" : "hover:bg-[var(--dashboard-card-hover)]"
                                            )}
                                        >
                                            {renderItem ? renderItem(item, selectedItem?.id === item.id) : (
                                                <>
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                                    ) : item.icon ? (
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                                            <item.icon className="w-4 h-4 text-muted-foreground" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center text-[var(--dashboard-accent-gold)] font-bold text-xs border border-[var(--dashboard-accent-gold)]/20">
                                                            {item.label.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className={cn("text-sm font-medium truncate", activeIndex === idx ? "text-[var(--dashboard-accent-gold)]" : "text-white")}>
                                                            {item.label}
                                                        </span>
                                                        {item.subLabel && (
                                                            <span className="text-xs text-muted-foreground truncate">{item.subLabel}</span>
                                                        )}
                                                    </div>

                                                    {selectedItem?.id === item.id && (
                                                        <Check className="w-4 h-4 text-[var(--dashboard-accent-gold)]" />
                                                    )}
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : query.length > 0 && !isLoading ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    <p>No results found for "{query}"</p>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground text-sm opacity-50">
                                    <p>Start typing to search...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
