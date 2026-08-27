/**
 * Sanitize user input before embedding in PostgREST `.or()` / filter strings.
 * Commas, periods, and parentheses are filter syntax and must not appear raw.
 */

const FILTER_UNSAFE = /[,.()\\]/g

/** Strip characters that can break or widen PostgREST filter expressions. */
export function sanitizePostgrestFilterValue(raw: string, maxLen = 100): string {
  return raw
    .replace(FILTER_UNSAFE, ' ')
    .replace(/%/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

/**
 * Build a safe `.or()` clause for multiple `ilike` columns.
 * Returns null if the query is empty after sanitization.
 */
export function buildIlikeOrFilter(columns: string[], query: string): string | null {
  const safe = sanitizePostgrestFilterValue(query)
  if (!safe || safe.length < 1) return null

  const parts = columns
    .filter((col) => /^[a-z_][a-z0-9_]*$/i.test(col))
    .map((col) => `${col}.ilike.%${safe}%`)

  if (parts.length === 0) return null
  return parts.join(',')
}
