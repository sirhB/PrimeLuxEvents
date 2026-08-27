/**
 * Checkout amount helpers — never trust client-supplied prices or paid amounts.
 */

/** Minimum deposit as a fraction of server-computed total (50%). */
export const MIN_DEPOSIT_RATIO = 0.5

export function clampCheckoutAmount(
  requested: number | undefined | null,
  totalAmount: number,
): { amount: number; isPartial: boolean } {
  const total = Math.max(0, Math.round(totalAmount))
  if (total <= 0) {
    return { amount: 0, isPartial: false }
  }

  const minDeposit = Math.ceil(total * MIN_DEPOSIT_RATIO)

  if (requested == null || !Number.isFinite(requested)) {
    return { amount: total, isPartial: false }
  }

  const rounded = Math.round(requested)
  const amount = Math.min(total, Math.max(minDeposit, rounded))
  return { amount, isPartial: amount < total }
}
