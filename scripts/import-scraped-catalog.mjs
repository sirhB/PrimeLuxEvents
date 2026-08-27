#!/usr/bin/env node
/**
 * Import scraped PrimeLux catalog into the linked plux Supabase project.
 *
 * Source: supabase/migrations/20251123_import_scraped_data_v2.sql
 * Images: keep local /images/products/... paths (and any absolute CDN URLs as-is)
 * Schema target: plux (categories without image_url; products.price_cents + sku)
 *
 * Usage:
 *   node scripts/import-scraped-catalog.mjs
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvLocal() {
  const envPath = resolve(root, '.env.local')
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    if (!process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

loadEnvLocal()

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_p_SUPABASE_URL ||
  process.env.p_SUPABASE_URL
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.p_SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function parseSqlSeed(sql) {
  const categories = []
  const catRe =
    /INSERT INTO categories \(name, slug, description, image_url, is_featured\)\s*VALUES \('((?:\\'|[^'])*)', '((?:\\'|[^'])*)', '((?:\\'|[^'])*)', '((?:\\'|[^'])*)', (true|false)\)/g
  let m
  while ((m = catRe.exec(sql))) {
    categories.push({
      name: m[1].replace(/''/g, "'"),
      slug: m[2],
      description: m[3].replace(/''/g, "'"),
      // plux has no categories.image_url — keep for logging only
      image_url: m[4],
      is_featured: m[5] === 'true',
    })
  }

  // Map var name -> slug from RETURNING id INTO cat_xxx after each insert.
  // Simpler: derive from slug field itself; product inserts reference cat_<slug_with_underscores>
  const slugToVar = new Map()
  const intoRe =
    /VALUES \('(?:\\'|[^'])*', '([^']+)',[\s\S]*?RETURNING id INTO (cat_[a-z0-9_]+);/g
  while ((m = intoRe.exec(sql))) {
    slugToVar.set(m[2], m[1])
  }

  const products = []
  // Split by INSERT INTO products blocks; each block has a shared category var
  const blockRe =
    /INSERT INTO products \(name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers\) VALUES\s*([\s\S]*?);/g
  while ((m = blockRe.exec(sql))) {
    const body = m[1]
    // Find category var used in this block (first product row)
    const catVarMatch = body.match(/,\s*(cat_[a-z0-9_]+)\s*,/)
    if (!catVarMatch) continue
    const catVar = catVarMatch[1]
    const categorySlug = slugToVar.get(catVar)
    if (!categorySlug) {
      console.warn('Unknown category var', catVar)
      continue
    }

    // Parse product tuples. Descriptions may contain escaped quotes as ''
    const rowRe =
      /\(\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*(\d+)\s*,\s*cat_[a-z0-9_]+\s*,\s*'((?:[^']|'')*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:[^']|'')*)'::jsonb\s*\)/g
    let row
    while ((row = rowRe.exec(body))) {
      products.push({
        name: row[1].replace(/''/g, "'"),
        description: row[2].replace(/''/g, "'"),
        price_cents: Number(row[3]),
        category_slug: categorySlug,
        image_url: row[4].replace(/''/g, "'"),
        quantity_available: Number(row[6]),
      })
    }
  }

  return { categories, products }
}

function dedupeProducts(products) {
  const seen = new Map()
  const unique = []
  let skipped = 0
  for (const p of products) {
    const key = p.name.trim().toLowerCase()
    if (seen.has(key)) {
      skipped++
      continue
    }
    seen.set(key, true)
    unique.push(p)
  }
  return { unique, skipped }
}

async function upsertCategories(categories) {
  // Keep existing demo categories; add scraped ones by slug.
  const startOrder = 100
  const rows = categories.map((c, i) => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    parent_id: null,
    sort_order: startOrder + i,
    is_active: true,
  }))

  const { data, error } = await sb
    .from('categories')
    .upsert(rows, { onConflict: 'slug' })
    .select('id, slug, name')

  if (error) throw new Error(`Category upsert failed: ${error.message}`)
  const bySlug = new Map(data.map((r) => [r.slug, r.id]))
  console.log(`Categories upserted: ${data.length}`)
  return bySlug
}

function makeSku(slug, index) {
  const base = slug.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  return `${base || 'ITEM'}-${String(index).padStart(4, '0')}`
}

async function upsertProducts(products, categoryIds) {
  const { data: existing } = await sb.from('products').select('slug, sku, name')
  const existingSlugs = new Set((existing || []).map((p) => p.slug))
  const existingSkus = new Set((existing || []).map((p) => p.sku))
  const existingNames = new Set((existing || []).map((p) => p.name.trim().toLowerCase()))

  const toInsert = []
  let skippedExisting = 0
  let missingCategory = 0

  products.forEach((p, index) => {
    if (existingNames.has(p.name.trim().toLowerCase())) {
      skippedExisting++
      return
    }
    const category_id = categoryIds.get(p.category_slug)
    if (!category_id) {
      missingCategory++
      return
    }

    let slug = slugify(p.name)
    if (!slug) slug = `product-${index}`
    let suffix = 0
    let candidate = slug
    while (existingSlugs.has(candidate)) {
      suffix++
      candidate = `${slug}-${suffix}`
    }
    slug = candidate
    existingSlugs.add(slug)

    let sku = makeSku(slug, index + 1)
    while (existingSkus.has(sku)) {
      sku = `${makeSku(slug, index + 1)}-${Math.random().toString(36).slice(2, 6)}`
    }
    existingSkus.add(sku)

    // Local path or absolute CDN URL — do not upload to storage
    const image_url = p.image_url

    toInsert.push({
      name: p.name,
      slug,
      description: p.description,
      category_id,
      sku,
      price_cents: p.price_cents,
      image_url,
      gallery_images: image_url ? [image_url] : null,
      minimum_rental_period: 1,
      is_active: true,
      specifications: {
        source: 'primeluxevents-scrape-v2',
        quantity_available: p.quantity_available,
      },
    })
  })

  console.log(
    `Products to insert: ${toInsert.length} (skip existing name: ${skippedExisting}, missing cat: ${missingCategory})`,
  )

  const batchSize = 50
  let inserted = 0
  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize)
    const { data, error } = await sb.from('products').insert(batch).select('id, slug')
    if (error) {
      throw new Error(`Product insert batch ${i / batchSize + 1} failed: ${error.message}`)
    }
    inserted += data.length

    // Seed one inventory unit per product when quantity known
    const inv = data.map((row, j) => {
      const src = batch[j]
      const qty = Math.max(1, Number(src.specifications?.quantity_available) || 1)
      // One representative inventory row (serial) — quantity tracked loosely
      return {
        product_id: row.id,
        serial_number: `${src.sku}-001`,
        status: 'available',
        location: 'Warehouse A',
        condition_notes: qty > 1 ? `Seeded from scrape; catalog qty≈${qty}` : null,
      }
    })
    const { error: invErr } = await sb.from('inventory').insert(inv)
    if (invErr) {
      console.warn(`Inventory insert warning (batch ${i / batchSize + 1}): ${invErr.message}`)
    }
  }

  console.log(`Products inserted: ${inserted}`)
  return inserted
}

async function main() {
  const sqlPath = resolve(root, 'supabase/migrations/20251123_import_scraped_data_v2.sql')
  const sql = readFileSync(sqlPath, 'utf8')
  const { categories, products } = parseSqlSeed(sql)
  console.log(`Parsed categories: ${categories.length}, product rows: ${products.length}`)

  const { unique, skipped } = dedupeProducts(products)
  console.log(`Unique products after name-dedupe: ${unique.length} (dropped duplicates: ${skipped})`)

  const categoryIds = await upsertCategories(categories)
  await upsertProducts(unique, categoryIds)

  const { count: catCount } = await sb.from('categories').select('id', { count: 'exact', head: true })
  const { count: prodCount } = await sb.from('products').select('id', { count: 'exact', head: true })
  console.log(`Done. categories=${catCount}, products=${prodCount}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
