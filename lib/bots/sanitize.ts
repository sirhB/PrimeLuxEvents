const SECRET_KEY = /password|secret|service_role|api_key|anon_key|key_hash|raw_key|webhook_secret|private_key|authorization/i
const SECRET_VALUE = [
  /\bservice_role\b/i,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/,
  /\bsk_(live|test)_[A-Za-z0-9]{8,}/i,
  /\bwhsec_[A-Za-z0-9]{8,}/i,
  /SUPABASE_(SERVICE_ROLE|ANON)_KEY/,
  /plxbot_[A-Za-z0-9_-]{16,}/,
]

export function sanitizeBotPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sanitizeBotPayload(item))
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && SECRET_VALUE.some((pattern) => pattern.test(value))) return '[redacted]'
    return value
  }
  const clean: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_KEY.test(key)) continue
    clean[key] = sanitizeBotPayload(item)
  }
  return clean
}
