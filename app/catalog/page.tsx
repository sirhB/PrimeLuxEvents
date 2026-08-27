import { getSiteContent } from "@/lib/content"
import CatalogClient from "./catalog-client"
import { fetchCatalogCategories, fetchCatalogProducts } from "@/lib/catalog/queries"
import { Metadata } from "next"

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse our complete collection of luxury event rentals.',
}

export default async function CatalogPage() {
  const content = await getSiteContent()

  const [products, categories] = await Promise.all([
    fetchCatalogProducts({ limit: 200, sort: 'newest' }),
    fetchCatalogCategories(),
  ])

  // plux has no packages table yet — keep empty until packages are migrated
  const packages: unknown[] = []

  // Enrich categories with a representative product image when category has no image_url
  const categoriesWithImages = categories.map((category) => {
    if (category.image_url) return category
    const sample = products.find((p) => p.category_id === category.id && p.image_url)
    return { ...category, image_url: sample?.image_url ?? null }
  })

  return (
    <CatalogClient
      heroTitle={content['catalog.hero.title']}
      products={products as any}
      categories={categoriesWithImages as any}
      packages={packages as any}
    />
  )
}
