'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface StatusFilterProps {
    statuses: { value: string; label: string }[]
    placeholder?: string
}

export function StatusFilter({ statuses, placeholder = 'All Statuses' }: StatusFilterProps) {
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
            <SelectTrigger className="w-[180px]">
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
