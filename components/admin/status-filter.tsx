'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Filter } from 'lucide-react'

interface StatusFilterProps {
    statuses: { value: string; label: string }[]
    placeholder?: string
}

function StatusFilterFallback({ placeholder = 'Filter by' }: Pick<StatusFilterProps, 'placeholder'>) {
    return (
        <Select disabled>
            <SelectTrigger className="w-auto gap-2 h-10 border-gray-300 rounded-lg">
                <Filter className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
        </Select>
    )
}

function StatusFilterInner({ statuses, placeholder = 'Filter by' }: StatusFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === 'all') {
            params.delete('status')
        } else {
            params.set('status', value)
        }
        params.set('page', '1')

        router.push(`?${params.toString()}`)
    }

    return (
        <Select
            value={searchParams.get('status') || 'all'}
            onValueChange={handleStatusChange}
        >
            <SelectTrigger className="w-auto gap-2 h-10 border-gray-300 rounded-lg hover:border-gray-400">
                <Filter className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                        {status.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export function StatusFilter(props: StatusFilterProps) {
    return (
        <Suspense fallback={<StatusFilterFallback placeholder={props.placeholder} />}>
            <StatusFilterInner {...props} />
        </Suspense>
    )
}
