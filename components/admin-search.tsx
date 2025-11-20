'use client'

import * as React from 'react'
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Search } from 'lucide-react'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { searchAdmin, type SearchResult } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/use-debounce' // Assuming this exists, if not I'll implement a simple debounce or remove it

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

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <span className="hidden lg:inline-flex">Search documentation...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Type a command or search..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {results.length > 0 && (
                        <CommandGroup heading="Results">
                            {results.map((result) => (
                                <CommandItem
                                    key={`${result.type}-${result.id}`}
                                    value={`${result.title} ${result.subtitle || ''}`}
                                    onSelect={() => {
                                        runCommand(() => router.push(result.url))
                                    }}
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{result.title}</span>
                                        {result.subtitle && (
                                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    <CommandSeparator />
                    <CommandGroup heading="Quick Links">
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/products'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Products</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/admin/orders'))}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Orders</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
