#!/usr/bin/env node
/**
 * Bootstrap + seed a fresh Supabase project with the live catalog.
 *
 * Copies categories / products / inventory from a populated source project
 * (default: plux) into TARGET, after applying the catalog bootstrap SQL.
 *
 * Required env (target = new Vercel-linked project):
 *   TARGET_DATABASE_URL          — direct Postgres URI for the new project
 *   TARGET_SUPABASE_URL          — https://xxxx.supabase.co
 *   TARGET_SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional source (defaults read from SOURCE_* or legacy plux env names):
 *   SOURCE_DATABASE_URL
 *   SOURCE_SUPABASE_URL
 *   SOURCE_SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node scripts/seed-new-database.mjs
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvLocal() {
  const envPath = resolve(root, '.env.local')
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    if (!process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

loadEnvLocal()

function first(...vals) {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

function readOptionalFile(path) {
  try {
    if (existsSync(path)) return readFileSync(path, 'utf8').trim()
  } catch {
    /* ignore */
  }
  return undefined
}

const targetDbUrl = first(
  process.env.TARGET_DATABASE_URL,
  process.env.DATABASE_URL,
)
const targetUrl = first(
  process.env.TARGET_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_URL,
)
const targetKey = first(
  process.env.TARGET_SUPABASE_SERVICE_ROLE_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const sourceDbUrl = first(
  process.env.SOURCE_DATABASE_URL,
  readOptionalFile('/tmp/plux_db_url.txt'),
)
const sourceUrl = first(
  process.env.SOURCE_SUPABASE_URL,
  process.env.SOURCE_NEXT_PUBLIC_SUPABASE_URL,
  readOptionalFile('/tmp/plux_url.txt'),
  'https://bxktvrvpksxaijhdjegh.supabase.co',
)
const sourceKey = first(
  process.env.SOURCE_SUPABASE_SERVICE_ROLE_KEY,
  readOptionalFile('/tmp/plux_service.txt'),
)

if (!targetDbUrl || !targetUrl || !targetKey) {
  console.error(
    'Missing TARGET_DATABASE_URL, TARGET_SUPABASE_URL, or TARGET_SUPABASE_SERVICE_ROLE_KEY',
  )
  process.exit(1)
}
if (!sourceDbUrl && !sourceKey) {
  console.error('Missing source credentials (SOURCE_DATABASE_URL or SOURCE_SUPABASE_SERVICE_ROLE_KEY)')
  process.exit(1)
}

const bootstrapPath = resolve(
  root,
  'supabase/migrations/20260917_bootstrap_catalog_for_new_project.sql',
)

function pgClient(connectionString) {
  return new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })
}

async function applyBootstrap(dbUrl) {
  const sql = readFileSync(bootstrapPath, 'utf8')
  const client = pgClient(dbUrl)
  await client.connect()
  try {
    await client.query(sql)
    console.log('Bootstrap SQL applied on target')
  } finally {
    await client.end()
  }
}

async function fetchAll(sb, table, columns = '*') {
  const pageSize = 1000
  let from = 0
  const rows = []
  for (;;) {
    const to = from + pageSize - 1
    const { data, error } = await sb.from(table).select(columns).range(from, to)
    if (error) throw new Error(`${table} fetch failed: ${error.message}`)
    rows.push(...(data || []))
    if (!data || data.length < pageSize) break
    from += pageSize
  }
  return rows
}

async function copyViaPostgres(sourceDb, targetDb) {
  const src = pgClient(sourceDb)
  const dst = pgClient(targetDb)
  await src.connect()
  await dst.connect()
  try {
    const cats = (await src.query('select * from public.categories order by sort_order nulls last, name')).rows
    const products = (await src.query('select * from public.products order by created_at nulls last')).rows
    const inventory = (await src.query('select * from public.inventory order by created_at nulls last')).rows
    console.log(
      `Source rows: categories=${cats.length}, products=${products.length}, inventory=${inventory.length}`,
    )

    await dst.query('begin')
    await dst.query('truncate table public.inventory, public.products, public.categories cascade')

    for (const row of cats) {
      await dst.query(
        `insert into public.categories
          (id, name, slug, description, parent_id, sort_order, is_active, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (id) do update set
           name=excluded.name, slug=excluded.slug, description=excluded.description,
           parent_id=excluded.parent_id, sort_order=excluded.sort_order,
           is_active=excluded.is_active`,
        [
          row.id,
          row.name,
          row.slug,
          row.description,
          row.parent_id,
          row.sort_order,
          row.is_active,
          row.created_at,
        ],
      )
    }

    for (const row of products) {
      await dst.query(
        `insert into public.products (
           id, name, slug, description, category_id, sku, price_cents, cost_cents,
           weight, dimensions_length, dimensions_width, dimensions_height, setup_time,
           requires_special_handling, minimum_rental_period, image_url, gallery_images,
           specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved
         ) values (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
         )
         on conflict (id) do update set
           name=excluded.name, slug=excluded.slug, description=excluded.description,
           category_id=excluded.category_id, sku=excluded.sku, price_cents=excluded.price_cents,
           cost_cents=excluded.cost_cents, image_url=excluded.image_url,
           gallery_images=excluded.gallery_images, specifications=excluded.specifications,
           is_active=excluded.is_active, quantity_available=excluded.quantity_available,
           quantity_reserved=excluded.quantity_reserved, updated_at=excluded.updated_at`,
        [
          row.id,
          row.name,
          row.slug,
          row.description,
          row.category_id,
          row.sku,
          row.price_cents,
          row.cost_cents,
          row.weight,
          row.dimensions_length,
          row.dimensions_width,
          row.dimensions_height,
          row.setup_time,
          row.requires_special_handling,
          row.minimum_rental_period,
          row.image_url,
          row.gallery_images,
          row.specifications,
          row.is_active,
          row.created_at,
          row.updated_at,
          row.quantity_available,
          row.quantity_reserved,
        ],
      )
    }

    for (const row of inventory) {
      await dst.query(
        `insert into public.inventory (
           id, product_id, serial_number, status, condition_notes, purchase_date,
           last_maintenance_date, next_maintenance_date, location, created_at, updated_at
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         on conflict (id) do update set
           product_id=excluded.product_id, serial_number=excluded.serial_number,
           status=excluded.status, condition_notes=excluded.condition_notes,
           location=excluded.location, updated_at=excluded.updated_at`,
        [
          row.id,
          row.product_id,
          row.serial_number,
          row.status,
          row.condition_notes,
          row.purchase_date,
          row.last_maintenance_date,
          row.next_maintenance_date,
          row.location,
          row.created_at,
          row.updated_at,
        ],
      )
    }

    await dst.query('commit')
    console.log('Catalog copy committed on target')
  } catch (err) {
    await dst.query('rollback')
    throw err
  } finally {
    await src.end()
    await dst.end()
  }
}

async function verifyTarget(url, key) {
  const sb = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const [{ count: products }, { count: categories }] = await Promise.all([
    sb.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])
  console.log(`Target verify: active products=${products}, active categories=${categories}`)
  if (!products) {
    throw new Error('Target still has 0 active products after seed')
  }
}

async function main() {
  console.log(`Target: ${targetUrl}`)
  console.log(`Source: ${sourceUrl || '(postgres only)'}`)
  await applyBootstrap(targetDbUrl)

  if (sourceDbUrl) {
    await copyViaPostgres(sourceDbUrl, targetDbUrl)
  } else {
    // REST fallback: read source via service role, write via target postgres
    const sourceSb = createClient(sourceUrl, sourceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const cats = await fetchAll(sourceSb, 'categories')
    const products = await fetchAll(sourceSb, 'products')
    const inventory = await fetchAll(sourceSb, 'inventory')
    console.log(
      `Source REST rows: categories=${cats.length}, products=${products.length}, inventory=${inventory.length}`,
    )

    const dst = pgClient(targetDbUrl)
    await dst.connect()
    try {
      await dst.query('begin')
      await dst.query('truncate table public.inventory, public.products, public.categories cascade')
      for (const row of cats) {
        await dst.query(
          `insert into public.categories
            (id, name, slug, description, parent_id, sort_order, is_active, created_at)
           values ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            row.id,
            row.name,
            row.slug,
            row.description,
            row.parent_id,
            row.sort_order,
            row.is_active,
            row.created_at,
          ],
        )
      }
      for (const row of products) {
        await dst.query(
          `insert into public.products (
             id, name, slug, description, category_id, sku, price_cents, cost_cents,
             weight, dimensions_length, dimensions_width, dimensions_height, setup_time,
             requires_special_handling, minimum_rental_period, image_url, gallery_images,
             specifications, is_active, created_at, updated_at, quantity_available, quantity_reserved
           ) values (
             $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23
           )`,
          [
            row.id,
            row.name,
            row.slug,
            row.description,
            row.category_id,
            row.sku,
            row.price_cents,
            row.cost_cents,
            row.weight,
            row.dimensions_length,
            row.dimensions_width,
            row.dimensions_height,
            row.setup_time,
            row.requires_special_handling,
            row.minimum_rental_period,
            row.image_url,
            row.gallery_images,
            row.specifications,
            row.is_active,
            row.created_at,
            row.updated_at,
            row.quantity_available,
            row.quantity_reserved,
          ],
        )
      }
      for (const row of inventory) {
        await dst.query(
          `insert into public.inventory (
             id, product_id, serial_number, status, condition_notes, purchase_date,
             last_maintenance_date, next_maintenance_date, location, created_at, updated_at
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            row.id,
            row.product_id,
            row.serial_number,
            row.status,
            row.condition_notes,
            row.purchase_date,
            row.last_maintenance_date,
            row.next_maintenance_date,
            row.location,
            row.created_at,
            row.updated_at,
          ],
        )
      }
      await dst.query('commit')
    } catch (err) {
      await dst.query('rollback')
      throw err
    } finally {
      await dst.end()
    }
  }

  await verifyTarget(targetUrl, targetKey)
  console.log('Done. Redeploy or soft-refresh https://prime-lux-events-beige.vercel.app/catalog')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
