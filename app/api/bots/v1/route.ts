import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { botKeyLooksValid, hashBotKey } from '@/lib/bots/keys'
import { isBotAction } from '@/lib/bots/policy'
import { sanitizeBotPayload } from '@/lib/bots/sanitize'

export const dynamic = 'force-dynamic'

const LIMIT = 60
const WINDOW_MS = 60_000

function json(status: number, body: unknown, extra?: Record<string, string>) {
  return NextResponse.json(sanitizeBotPayload(body), {
    status,
    headers: { 'Cache-Control': 'no-store', ...extra },
  })
}

function statusFor(result: { ok?: boolean; code?: string }) {
  if (result.ok) return 200
  if (result.code === 'rate_limited') return 429
  if (result.code === 'not_found' || result.code === 'unknown_action') return 404
  if (
    result.code === 'insufficient_scope' ||
    result.code === 'weekend_read_only' ||
    result.code === 'never_contact_clients' ||
    result.code === 'outside_schedule' ||
    result.code === 'bot_paused'
  ) {
    return 403
  }
  return 401
}

function bearer(request: Request) {
  const header = request.headers.get('authorization') || ''
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim())
  return (match?.[1] || request.headers.get('x-bot-key') || '').trim()
}

/**
 * Bot API. Tokens are hashed and checked inside bot_perform.
 * The service role is used only as the server transport and is never returned.
 */
export async function POST(request: Request) {
  const raw = bearer(request)
  if (!raw || !botKeyLooksValid(raw)) {
    return json(401, { error: { code: 'invalid_api_key', message: 'Provide a bot key via Authorization: Bearer.' } })
  }

  const keyHash = hashBotKey(raw)
  const rate = checkRateLimit(`bot:${keyHash}`, LIMIT, WINDOW_MS)
  if (!rate.allowed) {
    return json(
      429,
      { error: { code: 'rate_limited', message: 'Too many requests. Try again shortly.' } },
      { 'Retry-After': String(rate.retryAfterSec) },
    )
  }

  let payload: Record<string, unknown>
  try {
    payload = (await request.json()) as Record<string, unknown>
  } catch {
    return json(400, { error: { code: 'invalid_json', message: 'Body must be JSON.' } })
  }

  const action = typeof payload.action === 'string' ? payload.action : ''
  if (!isBotAction(action)) {
    return json(400, { error: { code: 'unknown_action', message: 'That action is not available.' } })
  }

  try {
    const admin = createServiceClient()
    const { data, error } = await admin.rpc('bot_perform', {
      p_key_hash: keyHash,
      p_action: action,
      p_payload: sanitizeBotPayload(payload),
    })
    if (error || !data) {
      return json(503, { error: { code: 'unavailable', message: 'The bot API could not reach the database.' } })
    }
    const result = data as { ok?: boolean; code?: string }
    return json(statusFor(result), result)
  } catch {
    return json(503, { error: { code: 'unavailable', message: 'The bot API could not reach the database.' } })
  }
}
