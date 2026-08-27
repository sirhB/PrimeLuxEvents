/**
 * Local verification for database data-safety helpers.
 * Run: node scripts/verify-data-safety.mjs
 *
 * Does not require a live Supabase project. For live RLS checks, apply
 * supabase/migrations/20260829_database_data_safety.sql then run the SQL
 * assertions in scripts/verify-data-safety-rls.sql against staging.
 */

import { createHmac, timingSafeEqual } from 'crypto'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

// --- filter sanitize (mirrors lib/supabase/filter-sanitize.ts) ---
const FILTER_UNSAFE = /[,.()\\]/g
function sanitizePostgrestFilterValue(raw, maxLen = 100) {
  return raw
    .replace(FILTER_UNSAFE, ' ')
    .replace(/%/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

function buildIlikeOrFilter(columns, query) {
  const safe = sanitizePostgrestFilterValue(query)
  if (!safe || safe.length < 1) return null
  const parts = columns
    .filter((col) => /^[a-z_][a-z0-9_]*$/i.test(col))
    .map((col) => `${col}.ilike.%${safe}%`)
  if (parts.length === 0) return null
  return parts.join(',')
}

// --- checkout amounts (mirrors lib/security/checkout-amounts.ts) ---
const MIN_DEPOSIT_RATIO = 0.5
function clampCheckoutAmount(requested, totalAmount) {
  const total = Math.max(0, Math.round(totalAmount))
  if (total <= 0) return { amount: 0, isPartial: false }
  const minDeposit = Math.ceil(total * MIN_DEPOSIT_RATIO)
  if (requested == null || !Number.isFinite(requested)) {
    return { amount: total, isPartial: false }
  }
  const rounded = Math.round(requested)
  const amount = Math.min(total, Math.max(minDeposit, rounded))
  return { amount, isPartial: amount < total }
}

// --- HMAC auth cache (mirrors lib/auth/middleware-auth.ts) ---
function signPayload(payloadB64, secret) {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url')
}
function serializeAuthCache(profile, secret) {
  const minProfile = {
    id: profile.id,
    roles: profile.roles,
    active: profile.active,
    ts: Date.now(),
  }
  const payloadB64 = Buffer.from(JSON.stringify(minProfile)).toString('base64url')
  return `${payloadB64}.${signPayload(payloadB64, secret)}`
}
function deserializeAuthCache(token, secret) {
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const payloadB64 = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = signPayload(payloadB64, secret)
  const bufA = Buffer.from(sig)
  const bufB = Buffer.from(expected)
  if (bufA.length !== bufB.length || !timingSafeEqual(bufA, bufB)) return null
  return JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
}

// --- tests ---
let passed = 0

{
  const injected = 'foo%),id.neq.0,name.ilike.%'
  const safe = sanitizePostgrestFilterValue(injected)
  assert(!safe.includes(','), 'sanitize strips commas')
  assert(!safe.includes(')'), 'sanitize strips parens')
  assert(!safe.includes('%'), 'sanitize strips percent')
  const or = buildIlikeOrFilter(['name', 'description'], injected)
  assert(or && !or.includes('id.neq'), 'or filter cannot widen via injection')
  assert(or === `name.ilike.%${safe}%,description.ilike.%${safe}%`, 'or filter shape')
  passed += 1
  console.log('ok filter sanitize / injection')
}

{
  const total = 10000
  assert(clampCheckoutAmount(undefined, total).amount === 10000, 'default full amount')
  assert(clampCheckoutAmount(1, total).amount === 5000, 'floor at 50% deposit')
  assert(clampCheckoutAmount(999999, total).amount === 10000, 'cap at total')
  assert(clampCheckoutAmount(7500, total).isPartial === true, 'partial flag')
  assert(clampCheckoutAmount(10000, total).isPartial === false, 'full not partial')
  passed += 1
  console.log('ok checkout amount clamp')
}

{
  const secret = 'test-secret-key'
  const token = serializeAuthCache(
    { id: 'user-1', roles: ['staff'], active: true },
    secret,
  )
  const ok = deserializeAuthCache(token, secret)
  assert(ok && ok.id === 'user-1' && ok.roles.includes('staff'), 'valid token verifies')

  // Legacy unsigned base64 must fail
  const forged = Buffer.from(
    JSON.stringify({ id: 'user-1', roles: ['admin'], active: true, ts: Date.now() }),
  ).toString('base64')
  assert(deserializeAuthCache(forged, secret) === null, 'unsigned legacy cookie rejected')

  // Tampered payload rejected
  const [payload] = token.split('.')
  const bad = `${payload}.${signPayload(payload, 'wrong-secret')}`
  assert(deserializeAuthCache(bad, secret) === null, 'wrong signature rejected')

  // Role escalation via payload rewrite rejected
  const evilPayload = Buffer.from(
    JSON.stringify({ id: 'attacker', roles: ['admin'], active: true, ts: Date.now() }),
  ).toString('base64url')
  const evil = `${evilPayload}.${token.split('.')[1]}`
  assert(deserializeAuthCache(evil, secret) === null, 'forged admin roles rejected')
  passed += 1
  console.log('ok HMAC auth cache')
}

{
  // Catalog select must not include cost_cents (static source check)
  const fs = await import('fs')
  const queries = fs.readFileSync(new URL('../lib/catalog/queries.ts', import.meta.url), 'utf8')
  // Extract the PRODUCT_LIST_SELECT template literal body
  const selectMatch = queries.match(/const PRODUCT_LIST_SELECT = `([\s\S]*?)`/)
  assert(selectMatch, 'PRODUCT_LIST_SELECT defined')
  assert(!/cost_cents/.test(selectMatch[1]), 'catalog select must not include cost_cents')
  assert(!/createServiceClient/.test(queries), 'catalog must not use service role')
  assert(/getSupabaseAnonKey/.test(queries), 'catalog uses anon key')
  passed += 1
  console.log('ok catalog client / cost_cents exclusion')
}

{
  const fs = await import('fs')
  const migration = fs.readFileSync(
    new URL('../supabase/migrations/20260829_database_data_safety.sql', import.meta.url),
    'utf8',
  )
  assert(migration.includes('customer_sign_order'), 'migration has sign RPC')
  assert(migration.includes('customer_claim_orders'), 'migration has claim RPC')
  assert(migration.includes('Staff can view tasks'), 'migration staff-only tasks')
  assert(migration.includes('is_staff()'), 'migration uses is_staff')
  assert(migration.includes('search_users'), 'migration hardens search_users')
  passed += 1
  console.log('ok migration contents')
}

console.log(`\nAll ${passed} verification groups passed.`)
