import { getSiteContent } from "@/lib/content"
import CatalogClient from "./catalog-client"
import { fetchCatalogCategories, fetchCatalogProducts } from "@/lib/catalog/queries"
import { Metadata } from "next"

export const revalidate = 0 // avoid serving a stale empty catalog during launch

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse furniture, lighting, tents, and decor for your event.',
}

export default async function CatalogPage() {
  const content = await getSiteContent()

  let products: Awaited<ReturnType<typeof fetchCatalogProducts>> = []
  let categories: Awaited<ReturnType<typeof fetchCatalogCategories>> = []
  let loadError: string | null = null

  try {
    ;[products, categories] = await Promise.all([
      fetchCatalogProducts({ limit: 200, sort: 'newest' }),
      fetchCatalogCategories(),
    ])
  } catch (err: any) {
    console.error('Catalog load failed:', err)
    loadError = err?.message || 'Failed to load catalog from Supabase'
  }

  if (!loadError && products.length === 0 && categories.length === 0) {
    loadError =
      'Catalog is empty. Seed the linked Supabase project (categories/products) and ensure public SELECT RLS is enabled — or confirm Vercel NEXT_PUBLIC_SUPABASE_URL / ANON_KEY point at the seeded database.'
    console.error(loadError)
  }

  const packages: unknown[] = []

  const categoriesWithImages = categories.map((category) => {
    if (category.image_url) return category
    const sample = products.find((p) => p.category_id === category.id && p.image_url)
    return { ...category, image_url: sample?.image_url ?? null }
  })

  return (
    <>
      {loadError && (
        <div className="bg-amber-500 text-black text-center text-sm font-medium px-4 py-3">
          {loadError}
        </div>
      )}
      <CatalogClient
        heroTitle={content['catalog.hero.title']}
        products={products as any}
        categories={categoriesWithImages as any}
        packages={packages as any}
      />
    </>
  )
}
