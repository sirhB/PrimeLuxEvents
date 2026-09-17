import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-8">
        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">404</p>
        <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight">Page not found</h1>
        <p className="text-gray-400 font-light leading-relaxed">
          This page doesn&apos;t exist or may have moved. Browse the collection or return home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/catalog"
            className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--champagne,#B8956B)] px-10 text-[11px] font-bold uppercase tracking-widest text-black"
          >
            View catalog
          </Link>
          <Link
            href="/"
            className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 px-10 text-[11px] font-bold uppercase tracking-widest text-white"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}
