'use server'

import { createClient } from '@/lib/supabase/server'
import { adaptProducts, adaptCategories, type LiveProduct, type LiveCategory } from '@/lib/catalog/adapters'

export async function searchProducts(query: string) {
  if (!query || query.length < 2) {
    return { products: [], categories: [] }
  }

  const supabase = await createClient()

  const [{ data: products, error }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price_cents,
          image_url,
          gallery_images,
          category_id,
          slug,
          sku,
          specifications,
          is_active
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10),
      supabase
        .from('categories')
        .select('id, name, slug, description, is_active, sort_order')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .limit(5),
    ])

  if (error) {
    console.error('Error searching products:', error)
  }
  if (categoriesError) {
    console.error('Error searching categories:', categoriesError)
  }

  // Attach category names for product results
  const categoryRows = (categories || []) as LiveCategory[]
  const { data: allCats } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)

  const byId = new Map(((allCats || []) as LiveCategory[]).map((c) => [c.id, c]))

  // Also search products whose category name matches
  const matchingCatIds = ((allCats || []) as LiveCategory[])
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .map((c) => c.id)

  let categoryProducts: LiveProduct[] = []
  if (matchingCatIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select(`
        id, name, description, price_cents, image_url, gallery_images,
        category_id, slug, sku, specifications, is_active
      `)
      .eq('is_active', true)
      .in('category_id', matchingCatIds)
      .limit(10)
    categoryProducts = (data || []) as LiveProduct[]
  }

  const merged = [...((products || []) as LiveProduct[]), ...categoryProducts]
  const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values())
  const withCats = unique.map((p) => {
    const cat = p.category_id ? byId.get(p.category_id) : undefined
    return {
      ...p,
      categories: cat ? { name: cat.name, slug: cat.slug } : null,
    }
  })

  return {
    products: adaptProducts(withCats),
    categories: adaptCategories(categoryRows),
  }
}
