'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  ClipboardCheck,
  ExternalLink,
  FileOutput,
  Loader2,
  Package,
  QrCode,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
  AdminStat,
  AdminStatGrid,
} from '@/components/admin/page-shell'
import { cn } from '@/lib/utils'
import {
  PREP_READINESS_LABELS,
  type PrepReadiness,
  type StageStatus,
  type WeekPrepOrderRow,
  type WeekPrepSummary,
} from '@/lib/warehouse/week-prep'
import type { WeekendWindow } from '@/lib/warehouse/weekend'
import { generateTasksForWeekendWindow } from '@/app/admin/week-prep/actions'

const READINESS_ORDER: PrepReadiness[] = [
  'not_started',
  'in_progress',
  'ready',
  'loaded',
  'delivered',
]

const READINESS_TONE: Record<PrepReadiness, string> = {
  not_started: 'bg-[var(--dashboard-text-muted)]/15 text-[var(--dashboard-text-muted)]',
  in_progress: 'bg-[var(--dashboard-accent-orange)]/15 text-[var(--dashboard-accent-orange)]',
  ready: 'bg-[var(--dashboard-accent-green)]/15 text-[var(--dashboard-accent-green)]',
  loaded: 'bg-[var(--dashboard-accent-blue)]/15 text-[var(--dashboard-accent-blue)]',
  delivered: 'bg-[var(--dashboard-accent-gold)]/15 text-[var(--dashboard-accent-gold)]',
}

function StageCell({ label, stage }: { label: string; stage: StageStatus }) {
  const pct = stage.progress ?? (stage.status === 'completed' ? 100 : 0)
  return (
    <div className="min-w-[7rem]">
      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">
        <span>{label}</span>
        <span>{stage.status === 'missing' ? '—' : `${pct}%`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--dashboard-border)]">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            stage.status === 'completed'
              ? 'bg-[var(--dashboard-accent-green)]'
              : stage.status === 'in_progress'
                ? 'bg-[var(--dashboard-accent-orange)]'
                : stage.status === 'missing'
                  ? 'bg-transparent'
                  : 'bg-[var(--dashboard-text-muted)]/40',
          )}
          style={{
            width: `${
              stage.status === 'missing' ? 0 : Math.max(pct, stage.status === 'pending' ? 8 : 0)
            }%`,
          }}
        />
      </div>
    </div>
  )
}

export function WeekPrepClient({
  window,
  rows,
  summary,
  offsetWeeks,
}: {
  window: WeekendWindow
  rows: WeekPrepOrderRow[]
  summary: WeekPrepSummary
  offsetWeeks: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [generateState, setGenerateState] = useState<string | null>(null)

  const goToOffset = (next: number) => {
    startTransition(() => {
      router.push(next === 0 ? '/admin/week-prep' : `/admin/week-prep?week=${next}`)
    })
  }

  const handleGenerate = () => {
    startTransition(async () => {
      setGenerateState(null)
      const result = await generateTasksForWeekendWindow(window.start, window.end)
      if (result.generated > 0) {
        setGenerateState(
          `Generated tasks for ${result.generated} order${result.generated === 1 ? '' : 's'}.`,
        )
      } else if (result.errors.length) {
        setGenerateState(result.errors[0] || 'Nothing to generate.')
      } else {
        setGenerateState('No eligible confirmed orders needed new tasks.')
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[var(--dashboard-border)] bg-transparent"
            onClick={() => goToOffset(offsetWeeks - 1)}
            disabled={pending}
            aria-label="Previous weekend"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>
          <p className="text-sm font-medium text-[var(--dashboard-text)]">{window.label}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[var(--dashboard-border)] bg-transparent"
            onClick={() => goToOffset(offsetWeeks + 1)}
            disabled={pending}
            aria-label="Next weekend"
          >
            Next
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          {offsetWeeks !== 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => goToOffset(0)} disabled={pending}>
              This weekend
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={pending}
            className="h-10 bg-[var(--dashboard-accent-gold)] text-[#000000] hover:bg-[var(--dashboard-accent-gold)]/90"
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ClipboardCheck className="mr-2 h-4 w-4" />
            )}
            Generate missing tasks
          </Button>
          <Button asChild variant="outline" className="h-10 border-[var(--dashboard-border)] bg-transparent">
            <Link href={`/admin/warehouse/schedule?from=${window.start}&to=${window.end}`}>
              <Package className="mr-2 h-4 w-4" />
              Warehouse week
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 border-[var(--dashboard-border)] bg-transparent">
            <Link href={`/admin/delivery?from=${window.start}&to=${window.end}`}>
              <Truck className="mr-2 h-4 w-4" />
              Delivery
            </Link>
          </Button>
        </div>
      </div>

      {generateState && (
        <p className="text-sm text-[var(--dashboard-text-muted)]" role="status">
          {generateState}
        </p>
      )}

      <AdminStatGrid>
        <AdminStat label="Weekend orders" value={summary.total} />
        <AdminStat label="Not started" value={summary.not_started} />
        <AdminStat label="In progress" value={summary.in_progress} />
        <AdminStat label="Ready" value={summary.ready} />
      </AdminStatGrid>

      <AdminPanel padded={false}>
        <div className="border-b border-[var(--dashboard-border)] p-4 sm:p-5">
          <AdminPanelHeader
            title="Weekend readiness board"
            description="Pick → pack → bags → load for each confirmed delivery this weekend."
          />
        </div>

        {rows.length === 0 ? (
          <div className="p-4 sm:p-5">
            <AdminEmptyState
              title="No deliveries this weekend"
              description="Confirmed orders with delivery dates in this Fri–Sun window will appear here."
              action={
                <Button asChild className="bg-[var(--dashboard-accent-gold)] text-[#000000]">
                  <Link href="/admin/orders">View orders</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-[var(--dashboard-border)]">
            {rows.map((row) => (
              <li
                key={row.orderId}
                className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/orders/${row.orderId}`}
                      className="truncate text-sm font-semibold text-[var(--dashboard-text)] hover:text-[var(--dashboard-accent-gold)]"
                    >
                      {row.customerName}
                    </Link>
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
                        READINESS_TONE[row.readiness],
                      )}
                    >
                      {PREP_READINESS_LABELS[row.readiness]}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--dashboard-text-muted)]">
                    {row.deliveryDate}
                    {row.deliveryTime ? ` · ${row.deliveryTime}` : ''}
                    {row.deliveryAddress ? ` · ${row.deliveryAddress}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <StageCell label="Pick" stage={row.pick} />
                    <StageCell label="Pack" stage={row.pack} />
                    <StageCell label="Load" stage={row.load} />
                    <div className="min-w-[7rem]">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[var(--dashboard-text-muted)]">
                        Bags
                      </p>
                      <p className="text-sm tabular-nums text-[var(--dashboard-text)]">
                        {row.bagsPacked}/{row.bagsAssigned || '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Button asChild size="sm" variant="outline" className="border-[var(--dashboard-border)] bg-transparent">
                    <Link href={`/admin/scan?orderId=${row.orderId}&from=${window.start}&to=${window.end}`}>
                      <QrCode className="mr-1.5 h-3.5 w-3.5" />
                      Scan
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-[var(--dashboard-border)] bg-transparent">
                    <Link href={`/admin/pack-slip?date=${row.deliveryDate}`}>
                      <FileOutput className="mr-1.5 h-3.5 w-3.5" />
                      Pack slip
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-[var(--dashboard-border)] bg-transparent">
                    <Link href={`/admin/bags?order=${row.orderId}`}>
                      <Box className="mr-1.5 h-3.5 w-3.5" />
                      Bags
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/orders/${row.orderId}`}>
                      Order
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {READINESS_ORDER.map((key) => (
          <div
            key={key}
            className="rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] px-3 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
              {PREP_READINESS_LABELS[key]}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--dashboard-text)]">{summary[key]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
