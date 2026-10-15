/** Client-safe catalog shapes and filtering. No filesystem or database access. */

export type PublicProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  /** Price in cents. */
  price: number
  image_url: string | null
  category_id: string | null
  category_name: string
  category_slug: string
  is_featured: boolean
  rental_price_daily: number
}

export type PublicCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_featured: boolean
  product_count: number
}

export type CatalogSort = 'name' | 'price-low' | 'price-high' | 'newest'

export function filterCatalogProducts(
  products: PublicProduct[],
  options?: {
    query?: string | null
    category?: string | null
    sort?: string | null
    limit?: number
  },
): PublicProduct[] {
  const query = options?.query?.trim().toLowerCase() || ''
  const category = options?.category?.trim().toLowerCase() || ''

  let list = products
  if (category) {
    list = list.filter(
      (product) =>
        product.category_name.toLowerCase() === category ||
        product.category_slug.toLowerCase() === category,
    )
  }
  if (query) {
    list = list.filter((product) => {
      const haystack = `${product.name} ${product.description || ''} ${product.category_name}`.toLowerCase()
      return haystack.includes(query)
    })
  }

  const sort = options?.sort || 'name'
  const sorted = [...list].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price
    if (sort === 'price-high') return b.price - a.price
    if (sort === 'newest') return Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name)
    return a.name.localeCompare(b.name)
  })

  const limit = options?.limit ?? sorted.length
  return sorted.slice(0, limit)
}

const SHOWROOM_PATTERNS: Array<[RegExp, number]> = [
  [/throne/i, 10],
  [/sofa/i, 8],
  [/chandelier|candelabra/i, 9],
  [/marquee|uplight|changing light/i, 7],
  [/arch/i, 6],
  [/bar counter|marble bar/i, 7],
  [/chiavari/i, 6],
  [/velvet/i, 4],
  [/pedestal/i, 4],
  [/flower wall|floral/i, 5],
]

export function pickShowroomPieces(products: PublicProduct[], limit = 7): PublicProduct[] {
  const scored = products
    .filter((product) => product.image_url && product.image_url.startsWith('/'))
    .map((product) => {
      let score = 0
      for (const [pattern, weight] of SHOWROOM_PATTERNS) {
        if (pattern.test(product.name)) score += weight
        else if (pattern.test(product.category_name)) score += Math.max(1, Math.round(weight / 3))
      }
      if (product.is_featured) score += 2
      return { product, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))

  const picked: PublicProduct[] = []
  const usedCategories = new Set<string>()
  for (const entry of scored) {
    if (usedCategories.has(entry.product.category_slug)) continue
    usedCategories.add(entry.product.category_slug)
    picked.push({ ...entry.product, is_featured: true })
    if (picked.length >= limit) break
  }

  if (picked.length < Math.min(4, limit)) {
    for (const product of products) {
      if (!product.image_url?.startsWith('/')) continue
      if (picked.some((item) => item.id === product.id)) continue
      picked.push(product)
      if (picked.length >= limit) break
    }
  }

  return picked
}
