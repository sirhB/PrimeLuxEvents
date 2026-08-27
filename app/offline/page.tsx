import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--ink,#121110)] px-6 text-center text-white">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--champagne,#B8956B)]">
        You are offline
      </p>
      <h1 className="mb-4 max-w-md font-serif text-3xl font-light tracking-tight md:text-4xl">
        Connection unavailable
      </h1>
      <p className="mb-8 max-w-sm text-sm text-white/70">
        PrimeLux needs a network connection for live orders and account data. Cached pages will reload when you are back online.
      </p>
      <Button asChild className="rounded-full bg-[var(--champagne,#B8956B)] px-8 text-black hover:bg-white">
        <Link href="/">Try again</Link>
      </Button>
    </main>
  )
}
