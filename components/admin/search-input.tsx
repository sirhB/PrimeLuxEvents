'use client'

import { Suspense } from 'react'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { useDebouncedCallback } from 'use-debounce'
import { cn } from '@/lib/utils'

function SearchInputFallback({
    placeholder,
    className,
}: {
    placeholder?: string
    className?: string
}) {
    return (
        <div className={cn('relative flex-1 md:max-w-md', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)]" />
            <Input
                type="search"
                placeholder={placeholder || 'Search...'}
                disabled
                className="pl-9 h-11 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] placeholder:text-[var(--dashboard-text-muted)]/50"
            />
        </div>
    )
}

function SearchInputInner({
    placeholder,
    className,
}: {
    placeholder?: string
    className?: string
}) {
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        params.set('page', '1')

        startTransition(() => {
            replace(`?${params.toString()}`)
        })
    }, 300)

    return (
        <div className={cn('relative flex-1 md:max-w-md', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)]" />
            <Input
                type="search"
                placeholder={placeholder || 'Search...'}
                className="pl-9 h-11 bg-black/20 border-none rounded-xl text-[var(--dashboard-text)] placeholder:text-[var(--dashboard-text-muted)]/50 focus:ring-1 focus:ring-[var(--dashboard-accent-gold)]/30 transition-all"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('search')?.toString()}
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-[var(--dashboard-accent-gold)] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    )
}

export function SearchInput(props: { placeholder?: string; className?: string }) {
    return (
        <Suspense fallback={<SearchInputFallback {...props} />}>
            <SearchInputInner {...props} />
        </Suspense>
    )
}
