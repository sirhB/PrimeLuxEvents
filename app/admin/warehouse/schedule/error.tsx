'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function WarehouseScheduleError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Warehouse schedule error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <h2 className="text-xl font-serif text-[var(--dashboard-text)]">Warehouse schedule unavailable</h2>
            <p className="text-sm text-[var(--dashboard-text-muted)] max-w-md">
                {error.message || 'Something went wrong loading the schedule. If you recently deployed, ensure the warehouse database migration has been applied.'}
            </p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="rounded-xl">
                    Try again
                </Button>
                <Button asChild className="rounded-xl">
                    <Link href="/admin">Back to dashboard</Link>
                </Button>
            </div>
        </div>
    )
}
