import { authenticateApiRequest, jsonError, jsonOk } from '@/lib/api/auth'
import { toPublicProduct } from '@/lib/api/catalog'
import { CATALOG_READ_SCOPE } from '@/lib/api/keys'
import { fetchProductBySlug } from '@/lib/catalog/queries'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ slug: string }>
}

/**
 * GET /api/v1/catalog/products/[slug]
 * Accepts product slug or UUID.
 */
export async function GET(request: Request, context: RouteContext) {
  const auth = await authenticateApiRequest(request, CATALOG_READ_SCOPE)
  if (!auth.ok) return auth.response

  const { slug } = await context.params
  if (!slug?.trim()) {
    return jsonError(400, 'invalid_slug', 'Product slug or id is required.')
  }

  const product = await fetchProductBySlug(decodeURIComponent(slug.trim()))
  if (!product) {
    return jsonError(404, 'not_found', 'Product not found.')
  }

  return jsonOk({ data: toPublicProduct(product) })
}
