/**
 * Adapters between live plux Supabase schema and the app's Product/Category DTOs.
 *
 * Live products: price_cents, gallery_images, is_active, sku, ...
 * App UI expects: price (cents), images[], rental_price_daily?, quantity_available?
 */

export type LiveProduct = {
  id: string
  name: string
  slug: string | null
  description: string | null
  category_id: string | null
  sku?: string | null
  price_cents?: number | null
  cost_cents?: number | null
  image_url?: string | null
  gallery_images?: string[] | null
  specifications?: Record<string, unknown> | null
  is_active?: boolean | null
  weight?: number | null
  minimum_rental_period?: number | null
  created_at?: string
  updated_at?: string
  categories?: { name: string; slug?: string | null } | null
  // legacy columns that may appear if ever present
  price?: number | null
  rental_price_daily?: number | null
  images?: string[] | null
  quantity_available?: number | null
  is_featured?: boolean | null
  stock?: number | null
}

export type LiveCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  parent_id?: string | null
  sort_order?: number | null
  is_active?: boolean | null
  created_at?: string
  image_url?: string | null
  is_featured?: boolean | null
}

export type AppProduct = {
  id: string
  name: string
  slug: string | null
  description: string | null
  category_id: string | null
  sku: string | null
  /** Price in cents for formatCurrency */
  price: number
  cost: number
  image_url: string | null
  images: string[]
  quantity_available: number
  rental_price_daily: number
  is_featured: boolean
  is_active: boolean
  minimum_rental_days: number
  categories?: { name: string; slug?: string | null } | null
  specifications?: Record<string, unknown> | null
  modifiers: unknown[]
  stock: number
}

export type AppCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_featured: boolean
  is_active: boolean
  sort_order: number
  parent_id: string | null
}

function asStringArray(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string')
  return []
}

export function adaptProduct(row: LiveProduct | null | undefined): AppProduct | null {
  if (!row) return null

  const price =
    typeof row.price_cents === 'number'
      ? row.price_cents
      : typeof row.price === 'number'
        ? row.price
        : 0

  const gallery = asStringArray(row.gallery_images)
  const legacyImages = asStringArray(row.images)
  const images =
    gallery.length > 0
      ? gallery
      : legacyImages.length > 0
        ? legacyImages
        : row.image_url
          ? [row.image_url]
          : []

  const qtyFromSpecs =
    typeof row.specifications?.quantity_available === 'number'
      ? (row.specifications.quantity_available as number)
      : undefined

  const quantity_available =
    typeof row.quantity_available === 'number'
      ? row.quantity_available
      : typeof qtyFromSpecs === 'number'
        ? qtyFromSpecs
        : typeof row.stock === 'number'
          ? row.stock
          : 1

  return {
    id: row.id,
    name: row.name,
    slug: row.slug ?? null,
    description: row.description ?? null,
    category_id: row.category_id ?? null,
    sku: row.sku ?? null,
    price,
    cost: typeof row.cost_cents === 'number' ? row.cost_cents : 0,
    image_url: row.image_url ?? images[0] ?? null,
    images,
    quantity_available,
    rental_price_daily: typeof row.rental_price_daily === 'number' ? row.rental_price_daily : price,
    is_featured: Boolean(row.is_featured),
    is_active: row.is_active !== false,
    minimum_rental_days: row.minimum_rental_period ?? 1,
    categories: row.categories ?? null,
    specifications: row.specifications ?? null,
    modifiers: [],
    stock: quantity_available,
  }
}

export function adaptProducts(rows: LiveProduct[] | null | undefined): AppProduct[] {
  return (rows || []).map(adaptProduct).filter((p): p is AppProduct => Boolean(p))
}

export function adaptCategory(row: LiveCategory | null | undefined): AppCategory | null {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? null,
    image_url: row.image_url ?? null,
    is_featured: Boolean(row.is_featured),
    is_active: row.is_active !== false,
    sort_order: row.sort_order ?? 0,
    parent_id: row.parent_id ?? null,
  }
}

export function adaptCategories(rows: LiveCategory[] | null | undefined): AppCategory[] {
  return (rows || []).map(adaptCategory).filter((c): c is AppCategory => Boolean(c))
}

/** Map app form fields → live plux write payload */
export function toLiveProductWrite(input: {
  name: string
  slug: string
  description?: string | null
  category_id?: string | null
  sku?: string | null
  price?: number | null // cents
  cost?: number | null // cents
  image_url?: string | null
  images?: string[] | null
  is_active?: boolean
  quantity_available?: number
}) {
  const image_url = input.image_url || input.images?.[0] || null
  const gallery_images = input.images?.length ? input.images : image_url ? [image_url] : null

  return {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    category_id: input.category_id || null,
    sku: input.sku || null,
    price_cents: input.price ?? 0,
    cost_cents: input.cost ?? 0,
    image_url,
    gallery_images,
    is_active: input.is_active ?? true,
    specifications: {
      quantity_available: input.quantity_available ?? 1,
    },
  }
}

export function toLiveCategoryWrite(input: {
  name: string
  slug: string
  description?: string | null
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
}) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    parent_id: input.parent_id ?? null,
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  }
}
