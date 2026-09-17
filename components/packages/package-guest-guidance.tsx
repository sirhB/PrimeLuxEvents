import { Users } from 'lucide-react'

type ItemLike = {
  quantity?: number
  product?: { name?: string } | null
  products?: { name?: string } | null
}

function estimateGuestRange(items: ItemLike[]): { min: number; max: number; basis: string } | null {
  let chairSeats = 0
  let placeSettings = 0

  for (const item of items) {
    const name = (item.product?.name || item.products?.name || '').toLowerCase()
    const qty = item.quantity || 1
    if (/chair|seat|stool/.test(name)) chairSeats += qty
    if (/plate|charger|place setting|flatware|napkin/.test(name)) placeSettings += qty
  }

  if (chairSeats >= 4) {
    return {
      min: Math.max(4, Math.floor(chairSeats * 0.85)),
      max: chairSeats,
      basis: 'from included seating',
    }
  }
  if (placeSettings >= 8) {
    return {
      min: Math.max(8, Math.floor(placeSettings * 0.8)),
      max: placeSettings,
      basis: 'from place settings',
    }
  }
  return null
}

export function PackageGuestGuidance({
  staticItems = [],
  packageName,
}: {
  staticItems?: ItemLike[]
  packageName?: string
}) {
  const estimate = estimateGuestRange(staticItems)
  const intimate = /intimate|elopement|cocktail|small/i.test(packageName || '')
  const large = /grand|gala|ballroom|large|estate/i.test(packageName || '')

  let headline = 'Guest-count guidance'
  let body =
    'Configure seating and tabletop quantities in the builder. Most collections work best when guest count matches your chair and place-setting totals.'

  if (estimate) {
    headline = `Typically ${estimate.min}–${estimate.max} guests`
    body = `Estimated ${estimate.basis}. Adjust options below if your headcount differs — we’ll confirm capacity when you checkout.`
  } else if (intimate) {
    headline = 'Best for intimate gatherings'
    body = 'Designed for smaller celebrations. Scale seating and tabletop pieces in the configurator to match your list.'
  } else if (large) {
    headline = 'Built for larger celebrations'
    body = 'Start with the included pieces, then expand seating and tabletop counts for your full guest list.'
  }

  return (
    <div className="rounded-md border border-gold/20 bg-gold/5 px-5 py-4 flex gap-4">
      <div className="h-10 w-10 shrink-0 rounded-[var(--radius-cta)] bg-gold/15 flex items-center justify-center text-gold">
        <Users className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">What’s included</p>
        <h3 className="mt-1 font-serif text-lg font-bold text-foreground">{headline}</h3>
        <p className="mt-1 text-sm text-muted-foreground font-light leading-relaxed">{body}</p>
      </div>
    </div>
  )
}
