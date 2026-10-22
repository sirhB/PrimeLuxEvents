import fs from 'fs'
import path from 'path'
import publicImages from '@/lib/generated/public-images.json'
import type { AppProduct } from '@/lib/catalog/adapters'
import {
  pickShowroomPieces,
  type PublicCategory,
  type PublicProduct,
} from '@/lib/catalog/catalog-view'

const PUBLIC_IMAGES = new Set(publicImages as string[])

const SQL_PATH = path.join(
  process.cwd(),
  'supabase/migrations/20251123_import_scraped_data_v2.sql',
)

type SeedCatalog = {
  products: PublicProduct[]
  categories: PublicCategory[]
}

let cached: SeedCatalog | null = null

function unescapeSql(value: string) {
  return value.replace(/''/g, "'")
}

function slugifyName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
  return slug || 'piece'
}

/** Split a SQL VALUES list into field arrays. Strings may contain commas and quotes. */
function parseValueTuples(block: string): string[][] {
  const rows: string[][] = []
  let i = 0

  while (i < block.length) {
    if (block[i] !== '(') {
      i += 1
      continue
    }
    i += 1
    const fields: string[] = []
    while (i < block.length) {
      while (block[i] === ' ' || block[i] === '\n' || block[i] === '\r' || block[i] === '\t') i += 1
      if (i >= block.length || block[i] === ')') {
        i += 1
        break
      }
      if (block[i] === ',') {
        i += 1
        continue
      }
      if (block[i] === "'") {
        i += 1
        let value = ''
        while (i < block.length) {
          if (block[i] === "'" && block[i + 1] === "'") {
            value += "'"
            i += 2
            continue
          }
          if (block[i] === "'") {
            i += 1
            break
          }
          value += block[i]
          i += 1
        }
        fields.push(unescapeSql(value))
        continue
      }
      let token = ''
      while (i < block.length && block[i] !== ',' && block[i] !== ')') {
        token += block[i]
        i += 1
      }
      const trimmed = token.trim()
      if (trimmed) fields.push(trimmed)
    }
    if (fields.length >= 5) rows.push(fields)
  }

  return rows
}

function imageExists(url: string | null) {
  if (!url || !url.startsWith('/images/')) return false
  return PUBLIC_IMAGES.has(url)
}

function parseSeedCatalog(sql: string): SeedCatalog {
  const categoriesByVar = new Map<string, Omit<PublicCategory, 'product_count' | 'image_url'> & { image_url: string | null }>()
  const categoryPattern =
    /VALUES \('((?:[^']|'')*)', '((?:[^']|'')*)', '((?:[^']|'')*)', '((?:[^']|'')*)', (true|false)\)[\s\S]*?RETURNING id INTO (cat_[a-z0-9_]+);/g

  for (const match of sql.matchAll(categoryPattern)) {
    const [, name, slug, description, imageUrl, featured, variable] = match
    categoriesByVar.set(variable, {
      id: `seed-cat-${slug}`,
      name: unescapeSql(name),
      slug,
      description: unescapeSql(description),
      image_url: imageUrl.includes('placehold.co') ? null : imageUrl,
      is_featured: featured === 'true',
    })
  }

  const productSection = sql.split('-- Products')[1] || ''
  const inserts = productSection.split(/INSERT INTO products/)
  const slugCounts = new Map<string, number>()
  const products: PublicProduct[] = []

  for (const insert of inserts) {
    const tuples = parseValueTuples(insert)
    for (const fields of tuples) {
      const [name, description, priceRaw, categoryVar, imageUrl, rentalRaw] = fields
      if (!name || !categoryVar?.startsWith('cat_')) continue
      const category = categoriesByVar.get(categoryVar)
      if (!category) continue
      const price = Number(priceRaw)
      const rental = Number(rentalRaw)
      if (!Number.isFinite(price)) continue

      const baseSlug = slugifyName(name)
      const slugKey = `${category.slug}:${baseSlug}`
      const seen = slugCounts.get(slugKey) || 0
      slugCounts.set(slugKey, seen + 1)
      const slug = seen === 0 ? baseSlug : `${baseSlug}-${seen + 1}`
      const localImage = imageUrl?.startsWith('/') ? imageUrl : null

      products.push({
        id: `seed:${category.slug}:${slug}`,
        name,
        slug,
        description: description || null,
        price,
        image_url: localImage && imageExists(localImage) ? localImage : null,
        category_id: category.id,
        category_name: category.name,
        category_slug: category.slug,
        is_featured: false,
        rental_price_daily: Number.isFinite(rental) ? rental : price,
      })
    }
  }

  const showroomIds = new Set(pickShowroomPieces(products, 8).map((product) => product.id))
  for (const product of products) {
    if (showroomIds.has(product.id)) product.is_featured = true
  }

  const categories: PublicCategory[] = [...categoriesByVar.values()]
    .map((category) => {
      const inCategory = products.filter((product) => product.category_slug === category.slug)
      const sample = inCategory.find((product) => product.image_url)
      return {
        ...category,
        image_url: category.image_url || sample?.image_url || null,
        product_count: inCategory.length,
      }
    })
    .filter((category) => category.product_count > 0)
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name))

  return { products, categories }
}

export function getSeedCatalog(): SeedCatalog {
  if (cached) return cached
  if (!fs.existsSync(SQL_PATH)) {
    cached = { products: [], categories: [] }
    return cached
  }
  const sql = fs.readFileSync(SQL_PATH, 'utf8')
  cached = parseSeedCatalog(sql)
  return cached
}

export function seedProductToApp(product: PublicProduct): AppProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category_id: product.category_id,
    sku: null,
    price: product.price,
    cost: 0,
    image_url: product.image_url,
    images: product.image_url ? [product.image_url] : [],
    quantity_available: 1,
    rental_price_daily: product.rental_price_daily,
    is_featured: product.is_featured,
    is_active: true,
    minimum_rental_days: 1,
    height: null,
    width: null,
    categories: { name: product.category_name, slug: product.category_slug },
    specifications: null,
    modifiers: [],
    stock: 1,
  }
}

export function findSeedProduct(categorySlug: string, productSlug: string): AppProduct | null {
  const { products } = getSeedCatalog()
  const match =
    products.find((product) => product.slug === productSlug && product.category_slug === categorySlug) ||
    products.find((product) => product.slug === productSlug || product.id === productSlug)
  return match ? seedProductToApp(match) : null
}
