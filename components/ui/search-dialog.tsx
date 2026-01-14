'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks/use-debounce'

export interface SearchDialogProps<T> {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSearch: (query: string) => Promise<T[]>
    onSelect: (item: T) => void
    renderItem: (item: T, isSelected: boolean) => React.ReactNode
    placeholder?: string
    title?: React.ReactNode
    emptyMessage?: string
    loadingMessage?: string
    className?: string
}

export function SearchDialog<T extends { id: string | number }>({
    open,
    onOpenChange,
    onSearch,
    onSelect,
    renderItem,
    placeholder = "Search...",
    title,
    emptyMessage = "No results found.",
    loadingMessage = "Searching...",
    className
}: SearchDialogProps<T>) {
    const [query, setQuery] = React.useState('')
    const [results, setResults] = React.useState<T[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const debouncedQuery = useDebounce(query, 300)

    React.useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    React.useEffect(() => {
        if (!open) {
            setQuery('')
            setResults([])
        }
    }, [open])

    React.useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const data = await onSearch(debouncedQuery)
                setResults(data)
                setActiveIndex(-1)
            } catch (error) {
                console.error("Search failed:", error)
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchResults()
    }, [debouncedQuery, onSearch])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onOpenChange(false)
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => (prev + 1) % results.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => (prev - 1 + results.length) % results.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeIndex >= 0 && results[activeIndex]) {
                onSelect(results[activeIndex])
                onOpenChange(false)
            }
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-24 px-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className={cn(
                                "w-full max-w-2xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[70vh]",
                                className
                            )}
                        >
                            {/* Header / Input */}
                            <div className="flex items-center px-4 py-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/50">
                                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholder}
                                    className="flex-1 bg-transparent border-none outline-none text-[var(--dashboard-text)] placeholder:text-muted-foreground text-base h-10"
                                />
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-[var(--dashboard-accent-gold)] ml-2" />
                                ) : (
                                    <button
                                        onClick={() => onOpenChange(false)}
                                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            {/* Results Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                <div className="space-y-1">
                                    {results.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                onSelect(item)
                                                onOpenChange(false)
                                            }}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            className={cn(
                                                "cursor-pointer transition-colors rounded-lg",
                                                activeIndex === idx ? "bg-[var(--dashboard-card-hover)]" : ""
                                            )}
                                        >
                                            {renderItem(item, activeIndex === idx)}
                                        </div>
                                    ))}
                                </div>

                                {query.length >= 2 && results.length === 0 && !isLoading && (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">{emptyMessage}</p>
                                    </div>
                                )}

                                {query.length < 2 && title && (
                                    <div className="py-8 text-center text-muted-foreground text-sm opacity-50">
                                        {title}
                                    </div>
                                )}
                            </div>

                            <div className="px-4 py-2 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/30">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1"><kbd className="px-1 bg-[var(--dashboard-background)] border rounded">↵</kbd> to select</span>
                                        <span className="flex items-center gap-1"><kbd className="px-1 bg-[var(--dashboard-background)] border rounded">↑↓</kbd> to navigate</span>
                                        <span className="flex items-center gap-1"><kbd className="px-1 bg-[var(--dashboard-background)] border rounded">ESC</kbd> to close</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
