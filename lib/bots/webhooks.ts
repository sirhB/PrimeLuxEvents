import { createHmac, timingSafeEqual } from 'node:crypto'

export function signWebhook(secret: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
}

export function verifyWebhook(secret: string, timestamp: string, body: string, signature: string): boolean {
  const expected = signWebhook(secret, timestamp, body)
  try {
    const left = Buffer.from(expected, 'hex')
    const right = Buffer.from(signature, 'hex')
    if (left.length === 0 || left.length !== right.length) return false
    return timingSafeEqual(left, right)
  } catch {
    return false
  }
}
