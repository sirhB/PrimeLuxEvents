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
    <main className="min-h-screen bg-[#F7F4EF] text-[#121110] flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-8">
        <p className="text-[var(--champagne,#B8956B)] text-[10px] font-bold uppercase tracking-[0.4em]">
          Something went wrong
        </p>
        <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight">
          We hit a snag
        </h1>
        <p className="text-gray-600 font-light leading-relaxed">
          Please try again. If the problem continues, contact us and we&apos;ll help finish your booking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-14 items-center justify-center rounded-full bg-[#121110] px-10 text-[11px] font-bold uppercase tracking-widest text-white"
          >
            Try again
          </button>
          <Link
            href="/contact"
            className="inline-flex h-14 items-center justify-center rounded-full border border-black/15 px-10 text-[11px] font-bold uppercase tracking-widest"
          >
            Contact support
          </Link>
        </div>
      </div>
    </main>
  )
}
