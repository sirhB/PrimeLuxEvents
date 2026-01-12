import { getSiteContent } from "@/lib/content"
import CatalogClient from "./catalog-client"
import { createClient } from "@/lib/supabase/server"
import { Suspense } from "react"

export const dynamic = 'force-dynamic'

function CatalogLoading() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
        <p className="text-gold text-sm font-light tracking-widest uppercase">Loading Collection...</p>
      </div>
    </div>
  )
}

export default async function CatalogPage() {
  const content = await getSiteContent()
  const supabase = await createClient()

  // Fetch products, categories, and packages separately to avoid relationship issues
  const [productsRes, categoriesRes, packagesRes] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('categories').select('*').order('name'),
    supabase.from('packages').select('*').order('created_at', { ascending: false })
  ])

  const products = productsRes.data || []
  const categories = categoriesRes.data || []
  const packages = packagesRes.data || []

  // Manually map category names and slugs to products to avoid joins
  const productsWithCategories = products.map(product => {
    const category = categories.find(c => c.id === product.category_id)
    return {
      ...product,
      categories: category ? { name: category.name, slug: category.slug } : null
    }
  })

  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogClient
        heroTitle={content['catalog.hero.title']}
        products={productsWithCategories as any}
        categories={categories}
        packages={packages}
      />
    </Suspense>
  )
}
