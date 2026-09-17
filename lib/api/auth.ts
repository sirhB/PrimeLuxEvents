import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, clientIpFromHeaders } from '@/lib/security/rate-limit'
import {
  apiKeyLooksValid,
  extractApiKeyFromHeaders,
  hashApiKey,
  scopesInclude,
  type ApiKeyRecord,
} from '@/lib/api/keys'

export type AuthenticatedApiKey = Pick<
  ApiKeyRecord,
  'id' | 'name' | 'key_prefix' | 'scopes' | 'is_active'
>

export type ApiAuthSuccess = {
  ok: true
  key: AuthenticatedApiKey
}

export type ApiAuthFailure = {
  ok: false
  response: NextResponse
}

const RATE_LIMIT = 120
const RATE_WINDOW_MS = 60_000

/**
 * Authenticate a public API request via Bearer token or X-API-Key.
 * Keys are stored hashed; lookup is by SHA-256 digest via service role.
 */
export async function authenticateApiRequest(
  request: Request,
  requiredScope: string,
): Promise<ApiAuthSuccess | ApiAuthFailure> {
  const rawKey = extractApiKeyFromHeaders(request.headers)

  if (!rawKey || !apiKeyLooksValid(rawKey)) {
    return {
      ok: false,
      response: jsonError(401, 'missing_api_key', 'Provide a valid API key via Authorization: Bearer or X-API-Key.'),
    }
  }

  const keyHash = hashApiKey(rawKey)
  let record: ApiKeyRecord | null = null

  try {
    const admin = createServiceClient()
    const { data, error } = await admin
      .from('api_keys')
      .select(
        'id, name, key_prefix, key_hash, scopes, is_active, created_by, last_used_at, expires_at, revoked_at, created_at, updated_at',
      )
      .eq('key_hash', keyHash)
      .maybeSingle()

    if (error) {
      console.error('api_keys lookup error:', error)
      return {
        ok: false,
        response: jsonError(503, 'auth_unavailable', 'API authentication is temporarily unavailable.'),
      }
    }

    record = (data as ApiKeyRecord | null) || null
  } catch (err) {
    console.error('api_keys auth error:', err)
    return {
      ok: false,
      response: jsonError(503, 'auth_unavailable', 'API authentication is temporarily unavailable.'),
    }
  }

  if (!record || !record.is_active || record.revoked_at) {
    return {
      ok: false,
      response: jsonError(401, 'invalid_api_key', 'API key is invalid or has been revoked.'),
    }
  }

  if (record.expires_at && new Date(record.expires_at).getTime() <= Date.now()) {
    return {
      ok: false,
      response: jsonError(401, 'expired_api_key', 'API key has expired.'),
    }
  }

  if (!scopesInclude(record.scopes, requiredScope)) {
    return {
      ok: false,
      response: jsonError(403, 'insufficient_scope', `This key lacks the required scope: ${requiredScope}`),
    }
  }

  const ip = clientIpFromHeaders(request.headers)
  const rate = checkRateLimit(`api-key:${record.id}:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)
  if (!rate.allowed) {
    return {
      ok: false,
      response: jsonError(429, 'rate_limited', 'Too many requests. Try again shortly.', {
        'Retry-After': String(rate.retryAfterSec),
      }),
    }
  }

  // Fire-and-forget last_used_at bump (ignore failures)
  void touchLastUsed(record.id)

  return {
    ok: true,
    key: {
      id: record.id,
      name: record.name,
      key_prefix: record.key_prefix,
      scopes: record.scopes,
      is_active: record.is_active,
    },
  }
}

async function touchLastUsed(keyId: string) {
  try {
    const admin = createServiceClient()
    await admin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyId)
  } catch {
    // ignore
  }
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  extraHeaders?: Record<string, string>,
) {
  return NextResponse.json(
    { error: { code, message } },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        ...extraHeaders,
      },
    },
  )
}

export function jsonOk<T>(data: T, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  })
}
