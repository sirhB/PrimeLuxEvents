import { createHash, randomBytes, timingSafeEqual } from 'crypto'

export const API_KEY_PREFIX = 'plx_'
export const CATALOG_READ_SCOPE = 'catalog:read'

export type ApiKeyRecord = {
  id: string
  name: string
  key_prefix: string
  key_hash: string
  scopes: string[]
  is_active: boolean
  created_by: string | null
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
  updated_at: string
}

export function generateApiKey(): { rawKey: string; keyPrefix: string; keyHash: string } {
  const secret = randomBytes(24).toString('base64url')
  const rawKey = `${API_KEY_PREFIX}${secret}`
  return {
    rawKey,
    keyPrefix: displayPrefix(rawKey),
    keyHash: hashApiKey(rawKey),
  }
}

export function displayPrefix(rawKey: string): string {
  // e.g. plx_AbCdEfGh…
  const body = rawKey.startsWith(API_KEY_PREFIX)
    ? rawKey.slice(API_KEY_PREFIX.length)
    : rawKey
  return `${API_KEY_PREFIX}${body.slice(0, 8)}`
}

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey.trim()).digest('hex')
}

export function extractApiKeyFromHeaders(
  headers: Headers | { get(name: string): string | null },
): string | null {
  const bearer = headers.get('authorization')
  if (bearer) {
    const match = /^Bearer\s+(.+)$/i.exec(bearer.trim())
    if (match?.[1]) return match[1].trim()
  }

  const headerKey = headers.get('x-api-key')
  if (headerKey?.trim()) return headerKey.trim()

  return null
}

export function apiKeyLooksValid(rawKey: string): boolean {
  return rawKey.startsWith(API_KEY_PREFIX) && rawKey.length >= API_KEY_PREFIX.length + 16
}

export function scopesInclude(scopes: string[] | null | undefined, required: string): boolean {
  if (!scopes || scopes.length === 0) return false
  if (scopes.includes('*') || scopes.includes('admin')) return true
  return scopes.includes(required)
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex')
    const bufB = Buffer.from(b, 'hex')
    if (bufA.length === 0 || bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}
