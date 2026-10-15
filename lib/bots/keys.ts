import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export const BOT_KEY_PREFIX = 'plxbot_'

export function generateBotKey(): { rawKey: string; keyPrefix: string; keyHash: string } {
  const secret = randomBytes(24).toString('base64url')
  const rawKey = `${BOT_KEY_PREFIX}${secret}`
  return { rawKey, keyPrefix: displayPrefix(rawKey), keyHash: hashBotKey(rawKey) }
}

export function displayPrefix(rawKey: string): string {
  return rawKey.slice(0, BOT_KEY_PREFIX.length + 8)
}

export function hashBotKey(rawKey: string): string {
  return createHash('sha256').update(rawKey.trim()).digest('hex')
}

export function botKeyLooksValid(rawKey: string): boolean {
  return rawKey.startsWith(BOT_KEY_PREFIX) && rawKey.length >= BOT_KEY_PREFIX.length + 24
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, 'hex')
    const right = Buffer.from(b, 'hex')
    if (left.length === 0 || left.length !== right.length) return false
    return timingSafeEqual(left, right)
  } catch {
    return false
  }
}
