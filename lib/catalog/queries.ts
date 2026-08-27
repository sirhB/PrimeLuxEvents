import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
} from '@/lib/supabase/env'
import {
  adaptCategories,
  adaptProduct,
  adaptProducts,
  type AppCategory,
  type AppProduct,
  type LiveCategory,
  type LiveProduct,
} from '@/lib/catalog/adapters'
import { buildIlikeOrFilter } from '@/lib/supabase/filter-sanitize'

/** Public catalog columns — never select cost_cents for client-facing paths. */
const PRODUCT_LIST_SELECT = `
  id,
  name,
  slug,
  description,
  category_id,
  sku,
  price_cents,
  image_url,
  gallery_images,
  specifications,
  is_active,
  minimum_rental_period,
  created_at,
  updated_at
`

function getCatalogClient() {
  // Anon key + RLS: public catalog policies expose active products only.
  // Do not use service role here — it bypasses RLS and can leak cost_cents / inactive rows.
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) {
    throw new Error('No Supabase credentials available for catalog queries')
  }
  return createSupabaseJsClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function fetchCatalogProducts(options?: {
  limit?: number
  categorySlug?: string | null
  query?: string | null
  sort?: string | null
  includeInactive?: boolean
}): Promise<AppProduct[]> {
  const supabase = getCatalogClient()
  const limit = options?.limit ?? 100

  const { data: categoryRows } = await supabase
    .from('categories')
    .select('id, name, slug, description, parent_id, sort_order, is_active')
    .eq('is_active', true)

  const categories = (categoryRows || []) as LiveCategory[]
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  let dbQuery = supabase.from('products').select(PRODUCT_LIST_SELECT)

  if (!options?.includeInactive) {
    dbQuery = dbQuery.eq('is_active', true)
  }

  if (options?.query) {
    const orFilter = buildIlikeOrFilter(['name', 'description'], options.query)
    if (orFilter) {
      dbQuery = dbQuery.or(orFilter)
    }
  }

  if (options?.categorySlug) {
    const match = categories.find(
      (c) => c.slug === options.categorySlug || c.name === options.categorySlug,
    )
    if (match) {
      dbQuery = dbQuery.eq('category_id', match.id)
    }
  }

  switch (options?.sort) {
    case 'price-low':
      dbQuery = dbQuery.order('price_cents', { ascending: true })
      break
    case 'price-high':
      dbQuery = dbQuery.order('price_cents', { ascending: false })
      break
    case 'newest':
      dbQuery = dbQuery.order('created_at', { ascending: false })
      break
    default:
      dbQuery = dbQuery.order('name', { ascending: true })
  }

  dbQuery = dbQuery.limit(limit)

  const { data, error } = await dbQuery
  if (error) {
    console.error('fetchCatalogProducts error:', error)
    return []
  }

  const withCats = ((data || []) as LiveProduct[]).map((p) => {
    const cat = p.category_id ? categoryById.get(p.category_id) : undefined
    return {
      ...p,
      categories: cat ? { name: cat.name, slug: cat.slug } : null,
    }
  })

  return adaptProducts(withCats)
}

export async function fetchCatalogCategories(): Promise<AppCategory[]> {
  const supabase = getCatalogClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, parent_id, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('fetchCatalogCategories error:', error)
    return []
  }

  return adaptCategories(data as LiveCategory[])
}

export async function fetchProductBySlug(productSlug: string): Promise<AppProduct | null> {
  const supabase = getCatalogClient()

  let row: LiveProduct | null = null

  const { data: bySlug } = await supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT)
    .eq('slug', productSlug)
    .eq('is_active', true)
    .maybeSingle()

  if (bySlug) {
    row = bySlug as LiveProduct
  } else {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productSlug)
    if (isUuid) {
      const { data: byId } = await supabase
        .from('products')
        .select(PRODUCT_LIST_SELECT)
        .eq('id', productSlug)
        .eq('is_active', true)
        .maybeSingle()
      row = (byId as LiveProduct) || null
    }
  }

  if (!row) return null

  if (row.category_id) {
    const { data: cat } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('id', row.category_id)
      .maybeSingle()
    if (cat) row.categories = cat
  }

  return adaptProduct(row)
}

export async function fetchRelatedProducts(limit = 48): Promise<AppProduct[]> {
  return fetchCatalogProducts({ limit, sort: 'newest' })
}

export async function fetchFeaturedProducts(limit = 8): Promise<AppProduct[]> {
  return fetchCatalogProducts({ limit, sort: 'newest' })
}
