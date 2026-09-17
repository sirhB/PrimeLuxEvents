/** Configurable refundable security deposit (separate from rental payment). */

export type SecurityDepositType = 'flat' | 'percent'

export type SecurityDepositConfig = {
  type: SecurityDepositType
  /** Flat amount in cents when type=flat */
  flatCents: number
  /** Percent of cart subtotal (merchandise) when type=percent */
  percent: number
}

export const DEFAULT_SECURITY_DEPOSIT_CONFIG: SecurityDepositConfig = {
  type: 'percent',
  flatCents: 10_000, // $100
  percent: 20,
}

/** Compute deposit from merchandise subtotal (cents, before tax/delivery). */
export function computeSecurityDepositCents(
  merchandiseSubtotalCents: number,
  config: SecurityDepositConfig = DEFAULT_SECURITY_DEPOSIT_CONFIG,
): number {
  const sub = Math.max(0, Math.round(merchandiseSubtotalCents))
  if (config.type === 'flat') {
    return Math.max(0, Math.round(config.flatCents))
  }
  const pct = Math.min(100, Math.max(0, config.percent))
  return Math.round((sub * pct) / 100)
}

export function parseSecurityDepositSettings(
  map: Record<string, string | undefined>,
): SecurityDepositConfig {
  const type = map.security_deposit_type === 'flat' ? 'flat' : 'percent'
  const flatCents = Number.parseInt(map.security_deposit_flat_cents || '', 10)
  const percent = Number.parseFloat(map.security_deposit_percent || '')
  return {
    type,
    flatCents: Number.isFinite(flatCents) && flatCents >= 0 ? flatCents : DEFAULT_SECURITY_DEPOSIT_CONFIG.flatCents,
    percent: Number.isFinite(percent) && percent >= 0 ? percent : DEFAULT_SECURITY_DEPOSIT_CONFIG.percent,
  }
}
