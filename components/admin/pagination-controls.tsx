'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationControlsProps {
    hasNextPage: boolean
    hasPrevPage: boolean
    totalCount: number
    currentPage: number
    pageSize: number
}

export function PaginationControls({
    hasNextPage,
    hasPrevPage,
    totalCount,
    currentPage,
    pageSize,
}: PaginationControlsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const totalPages = Math.ceil(totalCount / pageSize)

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalCount)}
                </span>{' '}
                of <span className="font-medium">{totalCount}</span> results
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                </Button>
                <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                </Button>
            </div>
        </div>
    )
}
