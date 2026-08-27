'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Admin page error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <h2 className="text-xl font-semibold text-[var(--dashboard-text)]">Something went wrong</h2>
            <p className="text-sm text-[var(--dashboard-text-muted)] max-w-md">
                {error.message || 'This admin page failed to load. Try again or return to the dashboard.'}
            </p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="rounded-md">
                    Try again
                </Button>
                <Button asChild className="rounded-md">
                    <Link href="/admin">Back to dashboard</Link>
                </Button>
            </div>
        </div>
    )
}
