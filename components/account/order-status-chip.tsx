import { cn } from '@/lib/utils'
import { StatusChip } from '@/components/shared/status-chip'

/** @deprecated Prefer StatusChip from components/shared/status-chip */
export function OrderStatusChip({ status }: { status: string }) {
  return <StatusChip status={status} className={cn('rounded-full')} />
}
