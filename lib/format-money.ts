/**
 * Format cents (integer) to USD currency string
 * @param cents - Amount in cents (e.g., 1250 for $12.50)
 * @returns Formatted currency string (e.g., "$12.50")
 */
export function formatCents(cents: number | null | undefined): string {
    const amount = typeof cents === 'number' && Number.isFinite(cents) ? cents : 0
    return `$${(amount / 100).toFixed(2)}`
}

/**
 * Format cents to USD with thousands separators
 * @param cents - Amount in cents
 * @returns Formatted currency string with commas (e.g., "$1,250.00")
 */
export function formatCentsWithCommas(cents: number | null | undefined): string {
    const amount = typeof cents === 'number' && Number.isFinite(cents) ? cents : 0
    const dollars = amount / 100
    return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
