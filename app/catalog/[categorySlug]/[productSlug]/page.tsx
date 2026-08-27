import { notFound } from "next/navigation"
import { ProductDetailClient } from "./product-detail-client"
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from "@/lib/catalog/queries"

export const revalidate = 60

export default async function ProductPage({ params }: { params: Promise<{ categorySlug: string, productSlug: string }> }) {
    const { categorySlug, productSlug } = await params

    const product = await fetchProductBySlug(productSlug)
    if (!product) {
        notFound()
    }

    if (
        product.categories?.slug &&
        categorySlug !== 'uncategorized' &&
        product.categories.slug !== categorySlug
    ) {
        console.warn(
            `Category slug mismatch: URL=${categorySlug}, DB=${product.categories.slug}`,
        )
    }

    const allProducts = await fetchRelatedProducts(80)

    const productWithImages = {
        ...product,
        // product_images table does not exist on plux — use gallery from adapter
        product_images: (product.images || []).map((url, index) => ({
            id: `${product.id}-${index}`,
            product_id: product.id,
            image_url: url,
            display_order: index,
            alt_text: product.name,
        })),
    }

    return (
        <ProductDetailClient
            product={productWithImages as any}
            allProducts={allProducts as any}
            colorVariants={[]}
        />
    )
}
