import { getSiteContent } from "@/lib/content"
import CatalogClient from "./catalog-client"
import { createClient } from "@/lib/supabase/server"

export default async function CatalogPage() {
  const content = await getSiteContent()
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('name')
    .order('name')

  return (
    <CatalogClient
      heroTitle={content['catalog.hero.title']}
      products={products || []}
      categories={['All', ...(categories?.map(c => c.name) || [])]}
    />
  )
}
