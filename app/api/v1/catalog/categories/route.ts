import { authenticateApiRequest, jsonOk } from '@/lib/api/auth'
import { toPublicCategory } from '@/lib/api/catalog'
import { CATALOG_READ_SCOPE } from '@/lib/api/keys'
import { fetchCatalogCategories } from '@/lib/catalog/queries'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/catalog/categories
 * Requires Authorization: Bearer plx_… or X-API-Key with catalog:read scope.
 */
export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, CATALOG_READ_SCOPE)
  if (!auth.ok) return auth.response

  const categories = await fetchCatalogCategories()

  return jsonOk({
    data: categories.map(toPublicCategory),
    meta: {
      count: categories.length,
    },
  })
}
