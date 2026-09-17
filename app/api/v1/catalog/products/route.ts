import { authenticateApiRequest, jsonOk } from '@/lib/api/auth'
import { parseLimitOffset, toPublicProduct } from '@/lib/api/catalog'
import { CATALOG_READ_SCOPE } from '@/lib/api/keys'
import { fetchCatalogProductsPage } from '@/lib/catalog/queries'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/catalog/products
 * Query: category (slug), q, sort (name|price-low|price-high|newest), limit, offset
 */
export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, CATALOG_READ_SCOPE)
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const { limit, offset } = parseLimitOffset(searchParams)
  const category = searchParams.get('category')
  const q = searchParams.get('q')
  const sort = searchParams.get('sort')

  const { products, total } = await fetchCatalogProductsPage({
    limit,
    offset,
    categorySlug: category,
    query: q,
    sort,
  })

  return jsonOk({
    data: products.map(toPublicProduct),
    meta: {
      count: products.length,
      total,
      limit,
      offset,
    },
  })
}
