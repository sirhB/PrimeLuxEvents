import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "./product-detail-client"

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product directly without joins to avoid relationship errors
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (productError || !product) {
    console.error('Error fetching product:', productError)
    notFound()
  }

  // Fetch category separately
  let categoryName = 'Premium Rental'
  if (product.category_id) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('name')
      .eq('id', product.category_id)
      .single()

    if (categoryData) {
      categoryName = categoryData.name
    }
  }

  // Fetch images separately
  const { data: productImages, error: imagesError } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id)
    .order('display_order')

  if (imagesError) {
    console.warn('Could not fetch product images:', imagesError.message)
  }

  // Fetch related products separately
  const { data: rawRelatedProducts } = await supabase
    .from('products')
    .select('*')
    .limit(12)
    .order('created_at', { ascending: false })

  // Combine data
  const productWithImages = {
    ...product,
    categories: { name: categoryName },
    product_images: productImages || []
  }

  return (
    <ProductDetailClient
      product={productWithImages as any}
      allProducts={(rawRelatedProducts || []) as any}
    />
  )
}
