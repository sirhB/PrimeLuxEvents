'use client'

import * as React from 'react'
import {
    Package,
    ShoppingCart,
    FileText,
    Users,
    Settings,
    Folder,
    Code,
    Search,
    LayoutDashboard,
    Wrench,
    Loader2,
    X,
    ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { searchAdmin, type SearchResult } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const typeIcons = {
    product: Package,
    order: ShoppingCart,
    consultation: FileText,
    customer: Users,
    category: Folder,
    setting: Wrench,
    content: Code,
}

const typeLabels = {
    product: 'Products',
    order: 'Orders',
    consultation: 'Leads',
    customer: 'Customers',
    category: 'Categories',
    setting: 'Settings',
    content: 'CMS Content',
}

const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'

    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800'
        case 'confirmed':
        case 'accepted':
            return 'bg-green-100 text-green-800'
        case 'processing':
            return 'bg-blue-100 text-blue-800'
        case 'delivered':
        case 'completed':
            return 'bg-purple-100 text-purple-800'
        case 'cancelled':
        case 'expired':
            return 'bg-red-100 text-red-800'
        case 'draft':
        case 'sent':
            return 'bg-gray-100 text-gray-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

export function AdminSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    React.useEffect(() => {
        if (open && inputRef.current) {
            // Small timeout to ensure modal is mounted
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    React.useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const data = await searchAdmin(query)
                setResults(data)
            } catch (error) {
                console.error('Search failed', error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    // Group results by type
    const groupedResults = React.useMemo(() => {
        const groups: Record<string, SearchResult[]> = {}
        results.forEach((result) => {
            if (!groups[result.type]) {
                groups[result.type] = []
            }
            groups[result.type].push(result)
        })
        return groups
    }, [results])

    const quickLinks = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
        { icon: FileText, label: 'Leads', href: '/admin/consultations' },
        { icon: Package, label: 'Products', href: '/admin/products' },
        { icon: Folder, label: 'Categories', href: '/admin/categories' },
        { icon: Users, label: 'Customers', href: '/admin/customers' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
        { icon: Code, label: 'CMS', href: '/admin/cms' },
    ]

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">Search orders, products, leads...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <div className="fixed inset-0 z-[101] flex items-start justify-center pt-24 px-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="w-full max-w-2xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[70vh]"
                            >
                                {/* Header / Input */}
                                <div className="flex items-center px-4 py-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/50">
                                    <Search className="h-5 w-5 text-muted-foreground mr-3" />
                                    <input
                                        ref={inputRef}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Type a command or search..."
                                        className="flex-1 bg-transparent border-none outline-none text-[var(--dashboard-text)] placeholder:text-muted-foreground text-base h-10"
                                    />
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-[var(--dashboard-accent-gold)] ml-2" />
                                    ) : (
                                        <div className="flex items-center gap-1 ml-2">
                                            <span className="px-1.5 py-0.5 rounded border border-[var(--dashboard-border)] bg-[var(--dashboard-background)] text-[10px] text-muted-foreground font-mono">ESC</span>
                                        </div>
                                    )}
                                </div>

                                {/* Results Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                    {/* Empty Search / Quick Links */}
                                    {query.length < 2 && (
                                        <div className="space-y-1">
                                            <h3 className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-70">
                                                Quick Links
                                            </h3>
                                            {quickLinks.map((item) => (
                                                <button
                                                    key={item.label}
                                                    onClick={() => runCommand(() => router.push(item.href))}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)] transition-colors text-left group"
                                                >
                                                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-[var(--dashboard-accent-gold)]" />
                                                    <span>{item.label}</span>
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Search Results */}
                                    {Object.entries(groupedResults).map(([type, items]) => {
                                        const Icon = typeIcons[type as keyof typeof typeIcons] || Package
                                        const label = typeLabels[type as keyof typeof typeLabels] || type

                                        return (
                                            <div key={type} className="mb-4 last:mb-0">
                                                <h3 className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-70 sticky top-0 bg-[var(--dashboard-card)]/95 backdrop-blur-sm z-10">
                                                    {label}
                                                </h3>
                                                <div className="space-y-1">
                                                    {items.map((result) => (
                                                        <button
                                                            key={`${result.type}-${result.id}`}
                                                            onClick={() => runCommand(() => router.push(result.url))}
                                                            className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-[var(--dashboard-card-hover)] transition-colors text-left group"
                                                        >
                                                            <div className="mt-0.5 p-1.5 rounded-md bg-[var(--dashboard-background)] border border-[var(--dashboard-border)]">
                                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="font-medium text-sm text-[var(--dashboard-text)] truncate">{result.title}</span>
                                                                    {result.metadata?.status && (
                                                                        <span className={`text-[10px] px-1.5 py-0 rounded-sm font-medium ${getStatusColor(result.metadata.status)}`}>
                                                                            {result.metadata.status}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {result.subtitle && (
                                                                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                                                                )}
                                                                {(result.metadata?.amount || result.metadata?.date) && (
                                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                                                        {result.metadata.amount && <span>{result.metadata.amount}</span>}
                                                                        {result.metadata.date && <span>• {result.metadata.date}</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {query.length >= 2 && results.length === 0 && !loading && (
                                        <div className="py-12 text-center text-muted-foreground">
                                            <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                            <p className="text-sm">No results found for "{query}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="px-4 py-2 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/30">
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><kbd className="px-1 bg-[var(--dashboard-background)] border rounded">↵</kbd> to select</span>
                                            <span className="flex items-center gap-1"><kbd className="px-1 bg-[var(--dashboard-background)] border rounded">↑↓</kbd> to navigate</span>
                                        </div>
                                        <span>PrimeLux Search</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

