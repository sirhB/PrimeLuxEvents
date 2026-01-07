'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { TableHead } from '@/components/ui/table'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableHeaderProps {
    column: string
    label: string
    className?: string
    sortMapping?: { asc: string; desc: string }
}

export function SortableHeader({ column, label, className, sortMapping }: SortableHeaderProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentSort = searchParams.get('sort') || ''

    // Default mapping if not provided
    const mapping = sortMapping || {
        asc: `${column}_asc`,
        desc: `${column}_desc`
    }

    const isAsc = currentSort === mapping.asc
    const isDesc = currentSort === mapping.desc

    const handleSort = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (isAsc) {
            params.set('sort', mapping.desc)
        } else if (isDesc) {
            params.delete('sort') // Reset or go back to newest (default)
        } else {
            params.set('sort', mapping.asc)
        }

        router.push(`?${params.toString()}`)
    }

    return (
        <TableHead
            sortable
            onClick={handleSort}
            className={cn("group transition-colors", className)}
        >
            <div className="flex items-center gap-2">
                {label}
                <div className="flex flex-col">
                    {isAsc ? (
                        <ChevronUp className="h-3 w-3 text-primary animate-in fade-in zoom-in duration-300" />
                    ) : isDesc ? (
                        <ChevronDown className="h-3 w-3 text-primary animate-in fade-in zoom-in duration-300" />
                    ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
            </div>
        </TableHead>
    )
}
