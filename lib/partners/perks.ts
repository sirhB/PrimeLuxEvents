import type { PartnerTier } from '@/lib/auth/partners'

export type PartnerPerk = {
  id: string
  label: string
  detail: string
}

/** Tier-aware perk copy for the partner portal (Phase 2 reporting). */
export function getPartnerPerks(
  tier: PartnerTier,
  holdHours: number,
  basePercent: number,
): PartnerPerk[] {
  const base: PartnerPerk[] = [
    {
      id: 'trade-rates',
      label: 'Exclusive trade rates',
      detail: `${basePercent}% off catalog merchandise when you settle with PrimeLux.`,
    },
    {
      id: 'holds',
      label: 'Priority inventory holds',
      detail: `${holdHours}-hour soft holds before deposit on partner bookings.`,
    },
    {
      id: 'white-label',
      label: 'White-label client invoices',
      detail: 'Share branded carts with retail pricing; collect from your client directly.',
    },
    {
      id: 'concierge',
      label: 'Partner concierge thread',
      detail: 'Message the PrimeLux team with partner priority on your account.',
    },
  ]

  if (tier === 'elite' || tier === 'house') {
    base.push({
      id: 'elite-rate',
      label: 'Elevated trade tier',
      detail:
        tier === 'house'
          ? 'House rate card with the deepest base discount and longest holds.'
          : 'Elite base discount and extended hold windows versus Preferred.',
    })
  }

  if (tier === 'house') {
    base.push({
      id: 'house-custom',
      label: 'Custom house terms',
      detail: 'Admin-negotiated overrides available on your partner profile.',
    })
  }

  return base
}
