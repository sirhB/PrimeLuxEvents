'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchProducts(query: string) {
  if (!query || query.length < 2) {
    return { products: [], categories: [] }
  }

  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      rental_price_daily,
      image_url,
      category_id,
      categories (
        name
      )
    `)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching products:', error)
    return { products: [], categories: [] }
  }

  // Also search for categories directly
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, image_url')
    .ilike('name', `%${query}%`)
    .limit(5)

  if (categoriesError) {
    console.error('Error searching categories:', categoriesError)
  }

  // Also search by category name if the query matches a category
  const { data: categoryProducts, error: categoryError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      rental_price_daily,
      image_url,
      category_id,
      categories!inner (
        name
      )
    `)
    .ilike('categories.name', `%${query}%`)
    .limit(10)

  if (categoryError) {
    console.error('Error searching products by category:', categoryError)
  }

  // Combine and deduplicate results
  const allProducts = [...(products || []), ...(categoryProducts || [])]
  const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values())

  return {
    products: uniqueProducts,
    categories: categories || []
  }
}
