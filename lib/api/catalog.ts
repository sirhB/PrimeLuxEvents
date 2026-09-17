import type { AppCategory, AppProduct } from '@/lib/catalog/adapters'

/** Public catalog product — never includes cost or internal fields. */
export type PublicApiProduct = {
  id: string
  name: string
  slug: string | null
  description: string | null
  sku: string | null
  price_cents: number
  image_url: string | null
  images: string[]
  quantity_available: number
  minimum_rental_days: number
  category: {
    id: string | null
    name: string
    slug: string | null
  } | null
  specifications: Record<string, unknown> | null
}

export type PublicApiCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  parent_id: string | null
}

export function toPublicProduct(product: AppProduct): PublicApiProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    price_cents: product.price,
    image_url: product.image_url,
    images: product.images,
    quantity_available: product.quantity_available,
    minimum_rental_days: product.minimum_rental_days,
    category: product.categories
      ? {
          id: product.category_id,
          name: product.categories.name,
          slug: product.categories.slug ?? null,
        }
      : null,
    specifications: product.specifications ?? null,
  }
}

export function toPublicCategory(category: AppCategory): PublicApiCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image_url: category.image_url,
    sort_order: category.sort_order,
    parent_id: category.parent_id,
  }
}

export function parseLimitOffset(searchParams: URLSearchParams, defaults?: { limit?: number; max?: number }) {
  const max = defaults?.max ?? 100
  const defaultLimit = defaults?.limit ?? 50

  const rawLimit = Number(searchParams.get('limit') ?? defaultLimit)
  const rawOffset = Number(searchParams.get('offset') ?? 0)

  const limit = Number.isFinite(rawLimit)
    ? Math.min(max, Math.max(1, Math.floor(rawLimit)))
    : defaultLimit
  const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0

  return { limit, offset }
}
