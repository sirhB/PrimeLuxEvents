import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-[color-mix(in_srgb,var(--sage)_18%,white)] text-[var(--ink)] border-[var(--sage)]/30',
  pending: 'bg-[color-mix(in_srgb,var(--champagne)_20%,white)] text-[var(--ink)] border-[var(--champagne)]/30',
  processing: 'bg-[color-mix(in_srgb,var(--champagne)_15%,white)] text-[var(--ink)] border-[var(--champagne)]/25',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

export function OrderStatusChip({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        STATUS_STYLES[normalized] || 'bg-muted text-muted-foreground border-border',
      )}
    >
      {label}
    </span>
  )
}
