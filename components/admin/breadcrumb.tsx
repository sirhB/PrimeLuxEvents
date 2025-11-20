'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

export function AdminBreadcrumb() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    // Remove 'admin' from segments
    const breadcrumbSegments = segments.slice(1)

    const formatSegment = (segment: string) => {
        // Handle UUIDs or special segments
        if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return 'Edit'
        }
        return segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Link
                href="/admin"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>
            {breadcrumbSegments.map((segment, index) => {
                const href = `/admin/${breadcrumbSegments.slice(0, index + 1).join('/')}`
                const isLast = index === breadcrumbSegments.length - 1

                return (
                    <Fragment key={segment}>
                        <ChevronRight className="h-4 w-4" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{formatSegment(segment)}</span>
                        ) : (
                            <Link href={href} className="hover:text-foreground transition-colors">
                                {formatSegment(segment)}
                            </Link>
                        )}
                    </Fragment>
                )
            })}
        </nav>
    )
}
