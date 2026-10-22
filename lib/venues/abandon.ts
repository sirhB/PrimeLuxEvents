export const DEFAULT_ABANDON_DAYS = 3

/** Parse the stored setting; anything invalid falls back to 3 days. */
export function parseAbandonDays(value: unknown): number {
  const n = Math.round(Number(value))
  return Number.isFinite(n) && n >= 1 && n <= 60 ? n : DEFAULT_ABANDON_DAYS
}
