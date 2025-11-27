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
    Tag,
    MessageSquare,
    Wrench
} from 'lucide-react'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { searchAdmin, type SearchResult } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

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
    consultation: 'Consultations',
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

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">Search orders, products, consultations...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search for orders, products, customers, consultations..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {loading ? 'Searching...' : 'No results found. Try a different search term.'}
                    </CommandEmpty>

                    {Object.entries(groupedResults).map(([type, items]) => {
                        const Icon = typeIcons[type as keyof typeof typeIcons]
                        const label = typeLabels[type as keyof typeof typeLabels]

                        return (
                            <CommandGroup key={type} heading={`${label} (${items.length})`}>
                                {items.map((result) => (
                                    <CommandItem
                                        key={`${result.type}-${result.id}`}
                                        value={`${result.title} ${result.subtitle || ''}`}
                                        onSelect={() => {
                                            runCommand(() => router.push(result.url))
                                        }}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{result.title}</span>
                                                {result.metadata?.status && (
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-xs px-2 py-0 ${getStatusColor(result.metadata.status)}`}
                                                    >
                                                        {result.metadata.status}
                                                    </Badge>
                                                )}
                                            </div>
                                            {result.subtitle && (
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {result.subtitle}
                                                </span>
                                            )}
                                            {(result.metadata?.amount || result.metadata?.date) && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    {result.metadata.amount && (
                                                        <span className="font-medium">{result.metadata.amount}</span>
                                                    )}
                                                    {result.metadata.date && (
                                                        <span>• {result.metadata.date}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )
                    })}

                    {results.length === 0 && !loading && query.length >= 2 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            <p>No results found for "{query}"</p>
                            <p className="text-xs mt-1">Try searching for orders, products, customers, or consultations</p>
                        </div>
                    )}

                    <CommandSeparator />
                    <CommandGroup heading="Quick Links">
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin'))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/orders'))}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            <span>Orders</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/consultations'))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Consultations</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/products'))}>
                            <Package className="mr-2 h-4 w-4" />
                            <span>Products</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/categories'))}>
                            <Folder className="mr-2 h-4 w-4" />
                            <span>Categories</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/customers'))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Customers</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/cms'))}>
                            <Code className="mr-2 h-4 w-4" />
                            <span>CMS</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}

