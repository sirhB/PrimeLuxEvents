'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { useDebouncedCallback } from 'use-debounce'

export function SearchInput({ placeholder }: { placeholder?: string }) {
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
        params.set('page', '1') // Reset to first page on search

        startTransition(() => {
            replace(`?${params.toString()}`)
        })
    }, 300)

    return (
        <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder || 'Search...'}
                className="pl-8"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('search')?.toString()}
            />
        </div>
    )
}
