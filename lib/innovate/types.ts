export type InnovateStudioId = 'backdrop' | 'atelier' | 'bar' | 'vip'

export type InnovateLineCategory =
  | 'rental'
  | 'fabrication'
  | 'hardware'
  | 'signage'
  | 'addon'
  | 'service'

export type InnovateLineItem = {
  sku: string
  label: string
  qty: number
  /** Unit price in cents */
  unitPrice: number
  category: InnovateLineCategory
}

export type InnovateQuote = {
  studio: InnovateStudioId
  title: string
  clientLabel?: string
  lines: InnovateLineItem[]
  config: Record<string, unknown>
  updatedAt: string
}

export type InnovateDraft = InnovateQuote & {
  id: string
}

export function quoteTotalCents(quote: Pick<InnovateQuote, 'lines'>): number {
  return quote.lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0)
}

export function formatQuoteSummary(quote: InnovateQuote): string {
  const total = quoteTotalCents(quote)
  const dollars = (total / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
  const lines = quote.lines
    .map((l) => `• ${l.label} ×${l.qty} — ${((l.unitPrice * l.qty) / 100).toFixed(2)}`)
    .join('\n')
  return [
    `PrimeLux Innovate Quote — ${quote.title}`,
    quote.clientLabel ? `Client: ${quote.clientLabel}` : null,
    '',
    lines,
    '',
    `Total: ${dollars}`,
    `Updated: ${quote.updatedAt}`,
  ]
    .filter(Boolean)
    .join('\n')
}
