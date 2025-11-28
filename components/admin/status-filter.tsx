'use client'

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

export function StatusFilter({ statuses, placeholder = 'Filter by' }: StatusFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === 'all') {
            params.delete('status')
        } else {
            params.set('status', value)
        }
        params.set('page', '1') // Reset to first page on filter change

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
