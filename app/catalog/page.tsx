import { getSiteContent } from "@/lib/content"
import CatalogClient from "./catalog-client"
import { loadPublicCatalog } from "@/lib/catalog/public-catalog"
import { filterCatalogProducts } from "@/lib/catalog/catalog-view"
import { Metadata } from "next"

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse furniture, lighting, tents, and décor for your next event.',
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const [content, catalog, params] = await Promise.all([
    getSiteContent(),
    loadPublicCatalog({ sort: 'name' }),
    searchParams,
  ])
  const products = params.category || params.search
    ? filterCatalogProducts(catalog.products, {
        category: params.category,
        query: params.search,
        sort: 'name',
        limit: 120,
      })
    : []
  const unavailable = catalog.products.length === 0 && catalog.categories.length === 0

  return (
    <>
      {unavailable && (
        <div className="bg-amber-500 text-black text-center text-sm font-medium px-4 py-3">
          Catalog is empty. Seed the linked Supabase project and confirm the public catalog can be read.
        </div>
      )}
      <CatalogClient
        heroTitle={content['catalog.hero.title']}
        products={products}
        categories={catalog.categories}
        showroom={catalog.showroom}
      />
    </>
  )
}
