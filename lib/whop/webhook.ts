import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Whop webhooks follow the Standard Webhooks spec:
 *   signed content = `${webhook-id}.${webhook-timestamp}.${raw body}`
 *   webhook-signature = space-separated `v1,<base64 HMAC-SHA256>`
 * Whop HMACs with the literal UTF-8 bytes of the `ws_...` secret (prefix included),
 * matching @whop/sdk's unwrapWebhook.
 */
export const WEBHOOK_TOLERANCE_SECONDS = 5 * 60

export class WebhookVerificationError extends Error {}

export type WebhookHeaders = { id: string; timestamp: string; signature: string }

export function readWebhookHeaders(h: Headers): WebhookHeaders {
  const id = h.get('webhook-id') ?? ''
  const timestamp = h.get('webhook-timestamp') ?? ''
  const signature = h.get('webhook-signature') ?? ''
  if (!id || !timestamp || !signature) throw new WebhookVerificationError('Missing webhook headers')
  return { id, timestamp, signature }
}

export function signWebhook(secret: string, id: string, timestamp: string, body: string): string {
  return createHmac('sha256', Buffer.from(secret, 'utf8')).update(`${id}.${timestamp}.${body}`).digest('base64')
}

export function verifyWebhook(
  body: string,
  headers: WebhookHeaders,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): void {
  if (!secret) throw new WebhookVerificationError('Webhook secret not configured')
  const ts = Number(headers.timestamp)
  if (!Number.isFinite(ts) || Math.abs(nowSeconds - ts) > WEBHOOK_TOLERANCE_SECONDS) {
    throw new WebhookVerificationError('Timestamp outside tolerance')
  }
  const expected = Buffer.from(signWebhook(secret, headers.id, headers.timestamp, body), 'base64')
  const ok = headers.signature.split(' ').some((part) => {
    const [version, sig] = part.split(',')
    if (version !== 'v1' || !sig) return false
    const got = Buffer.from(sig, 'base64')
    return got.length === expected.length && timingSafeEqual(got, expected)
  })
  if (!ok) throw new WebhookVerificationError('Signature mismatch')
}
