import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "./product-detail-client"

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ categorySlug: string, productSlug: string }> }) {
    const { categorySlug, productSlug } = await params
    const supabase = await createClient()

    // Fetch product - try slug first, then ID as fallback
    let product = null
    let productError = null

    // Try slug first
    const { data: slugData, error: slugError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productSlug)
        .maybeSingle()

    if (slugData) {
        product = slugData
    } else {
        // If not found by slug, try ID if it's a valid UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productSlug)
        if (isUuid) {
            const { data: idData, error: idError } = await supabase
                .from('products')
                .select('*')
                .eq('id', productSlug)
                .maybeSingle()

            if (idData) {
                product = idData
            } else {
                productError = idError
            }
        } else {
            productError = slugError
        }
    }

    if (!product) {
        console.error('Product not found for slug/id:', productSlug, productError)
        notFound()
    }

    // Fetch category separately
    let categoryName = 'Premium Rental'
    let dbCategorySlug = ''
    if (product.category_id) {
        const { data: categoryData } = await supabase
            .from('categories')
            .select('name, slug')
            .eq('id', product.category_id)
            .single()

        if (categoryData) {
            categoryName = categoryData.name
            dbCategorySlug = categoryData.slug

            // Verify category slug matches the URL
            if (dbCategorySlug !== categorySlug && categorySlug !== 'uncategorized') {
                // Optional: redirect to correct URL if desired, or just continue
                console.warn(`Category slug mismatch: URL=${categorySlug}, DB=${dbCategorySlug}`)
            }
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
    // We include category info in related products too
    // We fetch a larger pool of products to ensure the client-side scoring finds good matches
    const { data: rawRelatedProducts } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .limit(100)
        .order('created_at', { ascending: false })

    // Combine data
    const productWithImages = {
        ...product,
        categories: { name: categoryName, slug: dbCategorySlug },
        product_images: productImages || []
    }

    return (
        <ProductDetailClient
            product={productWithImages as any}
            allProducts={(rawRelatedProducts || []) as any}
        />
    )
}
