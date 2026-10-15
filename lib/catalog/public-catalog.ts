import type { AppCategory, AppProduct } from '@/lib/catalog/adapters'
import {
  filterCatalogProducts,
  pickShowroomPieces,
  type CatalogSort,
  type PublicCategory,
  type PublicProduct,
} from '@/lib/catalog/catalog-view'
import { fetchCatalogCategories, fetchCatalogProducts } from '@/lib/catalog/queries'
import { getSeedCatalog } from '@/lib/catalog/seed-snapshot'

export type PublicCatalog = {
  products: PublicProduct[]
  categories: PublicCategory[]
  showroom: PublicProduct[]
  source: 'live' | 'snapshot'
}

const LIVE_TIMEOUT_MS = 2500

let sourceDecision: Promise<'live' | 'snapshot'> | null = null

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('catalog timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function slimProduct(product: PublicProduct): PublicProduct {
  if (!product.description || product.description.length <= 160) return product
  return { ...product, description: `${product.description.slice(0, 157).trimEnd()}…` }
}

function fromAppProduct(product: AppProduct): PublicProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug || product.id,
    description: product.description ? product.description.slice(0, 320) : null,
    price: product.price,
    image_url: product.image_url,
    category_id: product.category_id,
    category_name: product.categories?.name || 'Collection',
    category_slug: product.categories?.slug || 'uncategorized',
    is_featured: product.is_featured,
    rental_price_daily: product.rental_price_daily,
  }
}

function categoriesFromProducts(categories: AppCategory[], products: PublicProduct[]): PublicCategory[] {
  return categories
    .map((category) => {
      const inCategory = products.filter((product) => product.category_slug === category.slug || product.category_id === category.id)
      const sample = inCategory.find((product) => product.image_url)
      const image = category.image_url && !category.image_url.includes('placehold.co')
        ? category.image_url
        : sample?.image_url || null
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: image,
        is_featured: category.is_featured,
        product_count: inCategory.length,
      }
    })
    .filter((category) => category.product_count > 0)
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name))
}

async function decideSource(): Promise<'live' | 'snapshot'> {
  if (!sourceDecision) {
    sourceDecision = (async () => {
      try {
        const probe = await withTimeout(fetchCatalogProducts({ limit: 1, sort: 'name' }), LIVE_TIMEOUT_MS)
        return probe.length > 0 ? 'live' : 'snapshot'
      } catch {
        return 'snapshot'
      }
    })()
  }
  return sourceDecision
}

function snapshotCatalog(): PublicCatalog {
  const seed = getSeedCatalog()
  return {
    products: seed.products,
    categories: seed.categories,
    showroom: pickShowroomPieces(seed.products).map(slimProduct),
    source: 'snapshot',
  }
}

export async function loadPublicCatalog(options?: { limit?: number; sort?: CatalogSort | null }): Promise<PublicCatalog> {
  const source = await decideSource()
  if (source === 'snapshot') {
    const snapshot = snapshotCatalog()
    const products = filterCatalogProducts(snapshot.products, {
      sort: options?.sort || 'name',
      limit: options?.limit,
    }).map(slimProduct)
    return { ...snapshot, products }
  }

  try {
    const [products, categories] = await withTimeout(
      Promise.all([
        fetchCatalogProducts({ limit: options?.limit ?? 200, sort: options?.sort || 'name' }),
        fetchCatalogCategories(),
      ]),
      LIVE_TIMEOUT_MS,
    )
    if (products.length === 0) return snapshotCatalog()
    const publicProducts = products.map(fromAppProduct).map(slimProduct)
    const publicCategories = categoriesFromProducts(categories, publicProducts)
    return {
      products: publicProducts,
      categories: publicCategories,
      showroom: pickShowroomPieces(publicProducts).map(slimProduct),
      source: 'live',
    }
  } catch {
    return snapshotCatalog()
  }
}

export async function searchPublicCatalog(query: string, sort: string, category: string | null) {
  const source = await decideSource()
  if (source === 'snapshot') {
    return filterCatalogProducts(getSeedCatalog().products, {
      query,
      category,
      sort,
      limit: 120,
    }).map(slimProduct)
  }

  try {
    const live = await withTimeout(
      fetchCatalogProducts({
        query: query || null,
        sort: sort || 'name',
        categorySlug: category,
        limit: 120,
      }),
      LIVE_TIMEOUT_MS,
    )
    if (live.length > 0 || (await decideSource()) === 'live') {
      return live.map(fromAppProduct).map(slimProduct)
    }
  } catch {
    // Fall through to the scraped catalog when the live project is unreachable.
  }

  return filterCatalogProducts(getSeedCatalog().products, {
    query,
    category,
    sort,
    limit: 120,
  }).map(slimProduct)
}
