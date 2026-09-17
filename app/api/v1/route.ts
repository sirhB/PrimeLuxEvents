import { authenticateApiRequest, jsonOk } from '@/lib/api/auth'
import { CATALOG_READ_SCOPE } from '@/lib/api/keys'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1 — Public API discovery (requires a valid catalog:read key).
 */
export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request, CATALOG_READ_SCOPE)
  if (!auth.ok) return auth.response

  return jsonOk({
    name: 'PrimeLux Public API',
    version: 'v1',
    key: {
      id: auth.key.id,
      name: auth.key.name,
      prefix: auth.key.key_prefix,
      scopes: auth.key.scopes,
    },
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/catalog/categories',
        description: 'List active rental categories',
      },
      {
        method: 'GET',
        path: '/api/v1/catalog/products',
        description: 'List active rental products',
        query: ['category', 'q', 'sort', 'limit', 'offset'],
      },
      {
        method: 'GET',
        path: '/api/v1/catalog/products/{slugOrId}',
        description: 'Fetch a single active product by slug or id',
      },
    ],
    auth: {
      headers: ['Authorization: Bearer <api_key>', 'X-API-Key: <api_key>'],
      scopes: [CATALOG_READ_SCOPE],
    },
  })
}
