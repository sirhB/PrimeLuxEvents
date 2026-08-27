'use client'

import { Suspense } from 'react'
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

function PaginationControlsFallback({
    hasNextPage,
    hasPrevPage,
    currentPage,
}: Pick<PaginationControlsProps, 'hasNextPage' | 'hasPrevPage' | 'currentPage'>) {
    return (
        <div className="flex items-center justify-center gap-1 py-4">
            <Button variant="outline" size="icon-sm" disabled className="text-gray-600">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
            </Button>
            <Button variant="default" size="icon-sm" disabled>
                {currentPage}
            </Button>
            <Button variant="outline" size="icon-sm" disabled={!hasNextPage} className="text-gray-600">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
            </Button>
        </div>
    )
}

function PaginationControlsInner({
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

    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)

            if (currentPage > 3) {
                pages.push('...')
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push('...')
            }

            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className="flex items-center justify-center gap-1 py-4">
            <Button
                variant="outline"
                size="icon-sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className="text-gray-600"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
            </Button>

            {getPageNumbers().map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                            ...
                        </span>
                    )
                }

                const pageNum = page as number
                const isActive = pageNum === currentPage

                return (
                    <Button
                        key={pageNum}
                        variant={isActive ? 'default' : 'ghost'}
                        size="icon-sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={isActive ? '' : 'text-gray-600 hover:text-gray-900'}
                    >
                        {pageNum}
                    </Button>
                )
            })}

            <Button
                variant="outline"
                size="icon-sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="text-gray-600"
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
            </Button>
        </div>
    )
}

export function PaginationControls(props: PaginationControlsProps) {
    return (
        <Suspense
            fallback={
                <PaginationControlsFallback
                    hasNextPage={props.hasNextPage}
                    hasPrevPage={props.hasPrevPage}
                    currentPage={props.currentPage}
                />
            }
        >
            <PaginationControlsInner {...props} />
        </Suspense>
    )
}
