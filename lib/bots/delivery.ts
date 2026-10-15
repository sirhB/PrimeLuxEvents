export const MAX_WEBHOOK_ATTEMPTS = 3

export function retryDelayMs(attempt: number): number {
  const steps = [30_000, 120_000, 600_000]
  return steps[Math.min(Math.max(attempt, 1), steps.length) - 1]
}

export function deliveryStatus(attempt: number, ok: boolean): 'delivered' | 'retrying' | 'failed' {
  if (ok) return 'delivered'
  if (attempt >= MAX_WEBHOOK_ATTEMPTS) return 'failed'
  return 'retrying'
}
