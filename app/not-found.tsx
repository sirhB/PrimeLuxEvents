import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="page-shell flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-8">
        <p className="lux-label">404</p>
        <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight">Page not found</h1>
        <p className="text-muted-foreground font-light leading-relaxed">
          This page doesn&apos;t exist or may have moved. Browse the collection or return home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/catalog" className="lux-cta">
            View catalog
          </Link>
          <Link href="/" className="lux-cta-ghost">
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}
