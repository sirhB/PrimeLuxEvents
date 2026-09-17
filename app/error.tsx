'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="page-shell flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-8">
        <p className="lux-label">Something went wrong</p>
        <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight">
          We hit a snag
        </h1>
        <p className="text-muted-foreground font-light leading-relaxed">
          Please try again. If the problem continues, contact us and we&apos;ll help finish your booking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button type="button" onClick={reset} className="lux-cta">
            Try again
          </button>
          <Link href="/contact" className="lux-cta-ghost">
            Contact support
          </Link>
        </div>
      </div>
    </main>
  )
}
