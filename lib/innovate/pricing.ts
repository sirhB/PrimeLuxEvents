import {
  BACKDROP_FRAMES,
  FLOOR_MATERIALS,
  NEON_BASE_CENTS,
  NEON_CHAR_CENTS,
  LOGO_FAB_CENTS,
  ATELIER_VIBES,
  BAR_BASES,
  BAR_ADDONS,
  BAR_WRAP_OPTIONS,
  VIP_HARDWARE,
  VIP_SERVICE_CENTS,
} from './catalog'
import type { InnovateLineItem } from './types'

export type BackdropConfig = {
  frameId: (typeof BACKDROP_FRAMES)[number]['id']
  materialId: (typeof FLOOR_MATERIALS)[number]['id']
  widthFt: number
  lengthFt: number
  neonText: string
  includeLogo: boolean
  ambienceId: string
}

export function priceBackdrop(config: BackdropConfig): InnovateLineItem[] {
  const frame = BACKDROP_FRAMES.find((f) => f.id === config.frameId) ?? BACKDROP_FRAMES[0]
  const material =
    FLOOR_MATERIALS.find((m) => m.id === config.materialId) ?? FLOOR_MATERIALS[0]
  const area = Math.max(1, config.widthFt) * Math.max(1, config.lengthFt)
  const lines: InnovateLineItem[] = [
    {
      sku: `frame-${frame.id}`,
      label: `${frame.label} rental`,
      qty: 1,
      unitPrice: frame.rentalCents,
      category: 'rental',
    },
    {
      sku: `wrap-${material.id}`,
      label: `${material.label} (${area} sq ft)`,
      qty: 1,
      unitPrice: Math.round(area * material.perSqFtCents),
      category: 'fabrication',
    },
  ]

  const neonChars = config.neonText.trim().length
  if (neonChars > 0) {
    lines.push({
      sku: 'neon-sign',
      label: `LED neon sign (${neonChars} chars)`,
      qty: 1,
      unitPrice: NEON_BASE_CENTS + neonChars * NEON_CHAR_CENTS,
      category: 'signage',
    })
  }

  if (config.includeLogo) {
    lines.push({
      sku: 'logo-fab',
      label: 'Custom logo fabrication layer',
      qty: 1,
      unitPrice: LOGO_FAB_CENTS,
      category: 'fabrication',
    })
  }

  return lines
}

export type AtelierConfig = {
  vibeId: (typeof ATELIER_VIBES)[number]['id']
  hardwareQty: Record<string, number>
}

export function defaultAtelierHardware(
  vibeId: (typeof ATELIER_VIBES)[number]['id'],
): Record<string, number> {
  const vibe = ATELIER_VIBES.find((v) => v.id === vibeId) ?? ATELIER_VIBES[0]
  return Object.fromEntries(vibe.hardware.map((h) => [h.sku, h.defaultQty]))
}

export function priceAtelier(config: AtelierConfig): InnovateLineItem[] {
  const vibe = ATELIER_VIBES.find((v) => v.id === config.vibeId) ?? ATELIER_VIBES[0]
  const lines: InnovateLineItem[] = [
    {
      sku: `vibe-${vibe.id}`,
      label: `${vibe.label} scene programming`,
      qty: 1,
      unitPrice: 9500,
      category: 'service',
    },
  ]

  for (const hw of vibe.hardware) {
    const qty = config.hardwareQty[hw.sku] ?? 0
    if (qty > 0) {
      lines.push({
        sku: hw.sku,
        label: hw.label,
        qty,
        unitPrice: hw.unitPriceCents,
        category: 'hardware',
      })
    }
  }

  return lines
}

export type BarConfig = {
  baseId: (typeof BAR_BASES)[number]['id']
  addonIds: string[]
  wrapId: (typeof BAR_WRAP_OPTIONS)[number]['id']
  brandText: string
}

export function priceBar(config: BarConfig): InnovateLineItem[] {
  const base = BAR_BASES.find((b) => b.id === config.baseId) ?? BAR_BASES[0]
  const wrap = BAR_WRAP_OPTIONS.find((w) => w.id === config.wrapId) ?? BAR_WRAP_OPTIONS[0]
  const lines: InnovateLineItem[] = [
    {
      sku: `bar-${base.id}`,
      label: `${base.label} rental`,
      qty: 1,
      unitPrice: base.rentalCents,
      category: 'rental',
    },
  ]

  for (const id of config.addonIds) {
    const addon = BAR_ADDONS.find((a) => a.id === id)
    if (addon) {
      lines.push({
        sku: `addon-${addon.id}`,
        label: addon.label,
        qty: 1,
        unitPrice: addon.rentalCents,
        category: 'addon',
      })
    }
  }

  if (wrap.fabCents > 0) {
    lines.push({
      sku: `wrap-${wrap.id}`,
      label: wrap.label + (config.brandText ? ` (“${config.brandText}”)` : ''),
      qty: 1,
      unitPrice: wrap.fabCents,
      category: 'fabrication',
    })
  }

  return lines
}

export type VipConfig = {
  guestCount: number
  hardwareSkus: string[]
  includeService: boolean
}

export function priceVip(config: VipConfig): InnovateLineItem[] {
  const lines: InnovateLineItem[] = []

  if (config.includeService) {
    lines.push({
      sku: 'vip-portal-service',
      label: `Digital guest portal (${config.guestCount} guests)`,
      qty: 1,
      unitPrice: VIP_SERVICE_CENTS + Math.max(0, config.guestCount) * 75,
      category: 'service',
    })
  }

  for (const sku of config.hardwareSkus) {
    const hw = VIP_HARDWARE.find((h) => h.sku === sku)
    if (hw) {
      lines.push({
        sku: hw.sku,
        label: hw.label,
        qty: hw.defaultQty,
        unitPrice: hw.unitPriceCents,
        category: 'hardware',
      })
    }
  }

  return lines
}
