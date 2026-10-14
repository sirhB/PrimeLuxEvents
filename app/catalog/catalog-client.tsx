'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { ShowroomCarousel } from '@/components/catalog/showroom-carousel'
import { EditorialCard } from '@/components/catalog/editorial-card'
import { filterCatalogProducts, type PublicCategory, type PublicProduct } from '@/lib/catalog/catalog-view'
import { cn, formatCurrency } from '@/lib/utils'

interface CatalogClientProps {
  heroTitle?: string
  products: PublicProduct[]
  categories: PublicCategory[]
  showroom: PublicProduct[]
}

const PAGE_SIZE = 8

export default function CatalogClient({ heroTitle, products, categories, showroom }: CatalogClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('name')
  const [pageState, setPageState] = useState({ key: '', page: 0 })
  const [remote, setRemote] = useState<{ key: string; products: PublicProduct[] } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const selectedCategory = searchParams.get('category')
  const browsingProducts = Boolean(selectedCategory || inputValue.trim())
  const viewKey = `${selectedCategory || ''}|${inputValue}|${sortBy}`
  const page = pageState.key === viewKey ? pageState.page : 0

  useEffect(() => {
    const key = viewKey
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      if (inputValue.trim()) params.set('search', inputValue.trim())
      else params.delete('search')
      if (selectedCategory) params.set('category', selectedCategory)
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      window.history.replaceState(null, '', nextUrl)

      startTransition(async () => {
        try {
          const { searchProducts } = await import('./actions')
          const results = await searchProducts(inputValue, sortBy, selectedCategory)
          setRemote({ key, products: results as PublicProduct[] })
        } catch {
          setRemote(null)
        }
      })
    }, 280)

    return () => window.clearTimeout(handle)
  }, [viewKey, inputValue, sortBy, selectedCategory, pathname])

  const local = useMemo(
    () => filterCatalogProducts(products, { query: inputValue, category: selectedCategory, sort: sortBy }),
    [products, inputValue, selectedCategory, sortBy],
  )
  const pieces = remote?.key === viewKey ? remote.products : local
  const pageCount = Math.max(1, Math.ceil((browsingProducts ? pieces.length : categories.length) / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const categoryPage = categories.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  const productPage = pieces.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const setCategory = (name: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (name) params.set('category', name)
    else params.delete('category')
    params.delete('search')
    setInputValue('')
    const next = params.toString()
    router.push(next ? `${pathname}?${next}` : pathname)
  }

  const headline = selectedCategory
    ? selectedCategory
    : inputValue.trim()
      ? 'Search'
      : heroTitle || 'Event rentals, curated to perfection'

  return (
    <main className="min-h-screen bg-[var(--theme-canvas)] text-[var(--theme-dark)]">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-6 pt-14 md:px-8 lg:grid-cols-12 lg:pt-20">
        <div className="lg:col-span-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--theme-accent-text)]">The collection</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-light leading-[0.95] tracking-tight md:text-7xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-[var(--theme-muted)] md:text-lg">
            {selectedCategory
              ? `${selectedCategory} for weddings, parties, and gatherings — ready to reserve.`
              : inputValue.trim()
                ? `Showing matches for “${inputValue.trim()}” in the rental catalog.`
                : 'From timeless seating to statement lighting, each piece is chosen for the room, the table, and the night.'}
          </p>
          {!selectedCategory && !inputValue.trim() && (
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--theme-accent-text)]">
              Elevate every occasion.
            </p>
          )}
        </div>
        <blockquote className="border-t border-[var(--theme-dark)]/10 pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-16">
          <p className="font-serif text-2xl font-light italic leading-snug text-[var(--theme-dark)]">
            “The room should feel finished before the first guest arrives.”
          </p>
          <footer className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--theme-muted)]">
            — PrimeLux Events
          </footer>
        </blockquote>
      </section>

      <div className="sticky top-[var(--header-height,7.25rem)] z-30 border-y border-[var(--theme-dark)]/10 bg-[var(--theme-canvas)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              aria-pressed={!selectedCategory}
              onClick={() => setCategory(null)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em]',
                !selectedCategory
                  ? 'bg-[var(--theme-accent)] text-[var(--theme-on-accent)]'
                  : 'border border-[var(--theme-dark)]/15 text-[var(--theme-dark)]',
              )}
            >
              All items
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedCategory === category.name}
                onClick={() => setCategory(category.name)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em]',
                  selectedCategory === category.name
                    ? 'bg-[var(--theme-accent)] text-[var(--theme-on-accent)]'
                    : 'border border-[var(--theme-dark)]/15 text-[var(--theme-dark)]',
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search the collection</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-accent-text)]" />
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Search the collection…"
                className="h-12 w-full rounded-full border border-[var(--theme-dark)]/15 bg-transparent pl-11 pr-4 text-sm font-light outline-none focus-visible:border-[var(--theme-accent)]"
              />
            </label>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--theme-dark)]/15 px-4 text-[11px] font-bold uppercase tracking-[0.16em] sm:hidden"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <label className={cn('items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em]', filtersOpen ? 'flex' : 'hidden sm:flex')}>
              Sort
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                className="h-12 rounded-full border border-[var(--theme-dark)]/15 bg-transparent px-4 font-medium normal-case tracking-normal"
              >
                <option value="name">Name</option>
                <option value="price-low">Price, low to high</option>
                <option value="price-high">Price, high to low</option>
                <option value="newest">Featured first</option>
              </select>
            </label>
            {isPending && <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--theme-muted)]">Updating</span>}
          </div>
        </div>
      </div>

      {!selectedCategory && !inputValue.trim() && <ShowroomCarousel pieces={showroom} variant="feature" />}

      <section id="collection" className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl font-light md:text-5xl">
            {browsingProducts ? 'Ready to reserve' : 'Collections'}
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--theme-accent-text)]">
            {String(safePage + 1).padStart(2, '0')} / {String(pageCount).padStart(2, '0')}
          </p>
        </div>

        {browsingProducts ? (
          remote?.key !== viewKey && productPage.length === 0 ? (
            <p className="py-16 text-center font-serif text-2xl font-light text-[var(--theme-muted)]">Gathering the collection…</p>
          ) : productPage.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {productPage.map((product, index) => (
                <EditorialCard
                  key={product.id}
                  href={`/catalog/${product.category_slug}/${product.slug}`}
                  title={product.name}
                  meta={formatCurrency(product.price)}
                  imageUrl={product.image_url}
                  eyebrow={product.category_name}
                  featured={index === 0}
                />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center font-serif text-2xl font-light text-[var(--theme-muted)]">
              Nothing in the collection matches that search yet.
            </p>
          )
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {categoryPage.map((category, index) => (
              <EditorialCard
                key={category.id}
                href={`/catalog?category=${encodeURIComponent(category.name)}`}
                title={category.name}
                meta={`${category.product_count} ${category.product_count === 1 ? 'item' : 'items'}`}
                imageUrl={category.image_url}
                featured={index === 0}
              />
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <div className="mt-10 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPageState({ key: viewKey, page: Math.max(0, page - 1) })}
              disabled={safePage === 0}
              className="text-[11px] font-bold uppercase tracking-[0.18em] disabled:opacity-30"
            >
              Previous
            </button>
            <div className="h-px flex-1 bg-[var(--theme-accent)]/40" />
            <button
              type="button"
              onClick={() => setPageState({ key: viewKey, page: Math.min(pageCount - 1, page + 1) })}
              disabled={safePage >= pageCount - 1}
              className="text-[11px] font-bold uppercase tracking-[0.18em] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
