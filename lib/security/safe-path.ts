/** Internal path only. Blocks protocol-relative and off-site redirects. */
export function safeInternalPath(value: string | null | undefined, fallback = '/account'): string {
  if (!value) return fallback
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback
  if (value.includes('://') || value.includes('\\') || value.includes('\0')) return fallback
  if (value.length > 500) return fallback
  return value
}
