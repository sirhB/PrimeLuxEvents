'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusChip } from '@/components/shared/status-chip'

type Step = {
  id: string
  label: string
  detail?: string
  done: boolean
  current: boolean
}

function buildSteps(order: {
  status?: string
  payment_status?: string
  signature_url?: string | null
  balance_paid?: number
  total_amount?: number
}): Step[] {
  const status = (order.status || 'pending').toLowerCase()
  const cancelled = status === 'cancelled'
  const paid =
    order.payment_status === 'paid' ||
    order.payment_status === 'succeeded' ||
    (order.total_amount != null && (order.balance_paid || 0) >= order.total_amount)

  const placedDone = true
  const signedDone = Boolean(order.signature_url)
  const confirmedDone = ['confirmed', 'delivered', 'completed'].includes(status)
  const deliveredDone = ['delivered', 'completed'].includes(status)
  const completedDone = status === 'completed'

  if (cancelled) {
    return [
      { id: 'placed', label: 'Order placed', done: true, current: false },
      { id: 'cancelled', label: 'Cancelled', done: true, current: true, detail: 'This rental was cancelled.' },
    ]
  }

  const steps: Step[] = [
    {
      id: 'placed',
      label: 'Order placed',
      done: placedDone,
      current: !signedDone && !confirmedDone,
      detail: paid ? 'Payment received' : 'Awaiting payment or deposit',
    },
    {
      id: 'signed',
      label: 'Agreement signed',
      done: signedDone,
      current: placedDone && !signedDone,
      detail: signedDone ? 'Rental agreement on file' : 'Signature required',
    },
    {
      id: 'confirmed',
      label: 'Confirmed for delivery',
      done: confirmedDone,
      current: signedDone && !confirmedDone,
      detail: confirmedDone ? 'Warehouse prep in progress' : 'We confirm after deposit & signature',
    },
    {
      id: 'delivered',
      label: 'Delivered',
      done: deliveredDone,
      current: confirmedDone && !deliveredDone,
      detail: deliveredDone ? 'On site' : 'Delivery window on your event date',
    },
    {
      id: 'completed',
      label: 'Pickup complete',
      done: completedDone,
      current: deliveredDone && !completedDone,
      detail: completedDone ? 'Rental closed' : 'After pickup and return audit',
    },
  ]

  return steps
}

export function OrderTimeline({ order }: { order: any }) {
  const steps = buildSteps(order)

  return (
    <div className="surface-panel rounded-md border border-gold/10 overflow-hidden">
      <div className="border-b border-border bg-[var(--surface-muted)] px-5 py-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-bold">Status</h2>
        <StatusChip status={order.status} />
      </div>
      <ol className="p-5 sm:p-6 space-y-0">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold',
                  step.done
                    ? 'bg-gold border-gold text-black'
                    : step.current
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-border text-muted-foreground',
                )}
                aria-hidden
              >
                {step.done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={cn('w-px flex-1 min-h-[1.25rem]', step.done ? 'bg-gold/40' : 'bg-border')}
                />
              )}
            </div>
            <div className={cn('pb-6', index === steps.length - 1 && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium',
                  step.current ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-xs text-muted-foreground font-light">{step.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
