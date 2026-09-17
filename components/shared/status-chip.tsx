import { cn } from '@/lib/utils'

/** Shared status vocabulary across customer / partner / admin / staff. */
export const STATUS_VOCAB: Record<
  string,
  { label: string; tone: 'neutral' | 'pending' | 'progress' | 'success' | 'danger' | 'info' }
> = {
  pending: { label: 'Pending', tone: 'pending' },
  confirmed: { label: 'Confirmed', tone: 'success' },
  processing: { label: 'In progress', tone: 'progress' },
  in_progress: { label: 'In progress', tone: 'progress' },
  ready: { label: 'Ready', tone: 'info' },
  loaded: { label: 'Loaded', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  paid: { label: 'Paid', tone: 'success' },
  succeeded: { label: 'Paid', tone: 'success' },
  unpaid: { label: 'Balance due', tone: 'pending' },
  partial: { label: 'Partial', tone: 'progress' },
  shared: { label: 'Shared', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'success' },
  active: { label: 'Active', tone: 'success' },
  suspended: { label: 'Suspended', tone: 'danger' },
  revoked: { label: 'Revoked', tone: 'danger' },
}

const TONE_STYLES: Record<string, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  pending:
    'bg-[color-mix(in_srgb,var(--champagne)_20%,transparent)] text-foreground border-[var(--champagne)]/30',
  progress:
    'bg-[color-mix(in_srgb,var(--champagne)_12%,transparent)] text-foreground border-[var(--champagne)]/25',
  success:
    'bg-[color-mix(in_srgb,var(--sage)_18%,transparent)] text-foreground border-[var(--sage)]/30',
  danger: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-300',
  info: 'bg-gold/10 text-gold border-gold/25',
}

export function statusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown'
  const key = status.toLowerCase().replace(/\s+/g, '_')
  return STATUS_VOCAB[key]?.label || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
}

export function StatusChip({
  status,
  className,
  label,
}: {
  status: string | null | undefined
  className?: string
  label?: string
}) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '_')
  const vocab = STATUS_VOCAB[key]
  const tone = vocab?.tone || 'neutral'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        TONE_STYLES[tone],
        className,
      )}
    >
      {label || statusLabel(status)}
    </span>
  )
}
