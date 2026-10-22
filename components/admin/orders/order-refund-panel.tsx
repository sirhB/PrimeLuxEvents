'use client'

import { useState, useTransition } from 'react'
import { Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { refundOrderPayment } from '@/app/admin/orders/refund-actions'
import { formatCents } from '@/lib/format-money'
import { planRefund } from '@/lib/orders/refund'

type RefundRow = {
    id: string
    amount_cents: number
    reason: string
    status: string
    created_at: string
    created_by_email: string | null
}

function newKey() {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().replace(/-/g, '')
        : `${Date.now()}${Math.random().toString(36).slice(2)}`.padEnd(16, '0')
}

export function OrderRefundPanel({
    orderId,
    paidCents,
    refundedCents,
    hasStripePayment,
    refunds,
}: {
    orderId: string
    paidCents: number
    refundedCents: number
    hasStripePayment: boolean
    refunds: RefundRow[]
}) {
    const [mode, setMode] = useState<'full' | 'partial'>('full')
    const [dollars, setDollars] = useState('')
    const [reasonCode, setReasonCode] = useState('requested_by_customer')
    const [note, setNote] = useState('')
    const [open, setOpen] = useState(false)
    const [key, setKey] = useState(newKey)
    const [pending, startTransition] = useTransition()
    const remaining = Math.max(0, paidCents - refundedCents)
    const requested = mode === 'full' ? null : Math.round(Number(dollars) * 100)
    const plan = planRefund(paidCents, refundedCents, requested)

    if (!hasStripePayment) {
        return <p className="text-sm text-[var(--dashboard-text-muted)]">No Stripe payment on this order, so there is nothing to refund here.</p>
    }

    function submit() {
        startTransition(async () => {
            const result = await refundOrderPayment({ orderId, amountCents: requested, reasonCode, reasonNote: note, idempotencyKey: key })
            if (result.success) {
                toast.success(`${result.duplicate ? 'Already refunded' : 'Refunded'} ${formatCents(result.amount)}${result.status === 'pending' ? ' (pending at Stripe)' : result.status === 'partial' ? ' (partly; see the refund log)' : ''}`)
                setNote('')
                setDollars('')
                setKey(newKey())
                setOpen(false)
            } else {
                toast.error(result.error)
                setOpen(false)
            }
        })
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-[var(--dashboard-text-muted)]">
                Paid <span className="tabular-nums text-[var(--dashboard-text)]">{formatCents(paidCents)}</span> · refunded{' '}
                <span className="tabular-nums text-[var(--dashboard-text)]">{formatCents(refundedCents)}</span> · refundable{' '}
                <span className="tabular-nums text-[var(--dashboard-text)]">{formatCents(remaining)}</span>
            </p>
            {remaining > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex gap-2 md:col-span-2" role="radiogroup" aria-label="Refund amount">
                        {(['full', 'partial'] as const).map((item) => (
                            <button key={item} type="button" role="radio" aria-checked={mode === item} onClick={() => setMode(item)}
                                className={`min-h-10 border px-4 text-xs font-medium ${mode === item ? 'bg-[var(--theme-dark)] text-[var(--theme-on-dark)]' : 'border-[var(--dashboard-border)]'}`}>
                                {item === 'full' ? `Full (${formatCents(remaining)})` : 'Partial'}
                            </button>
                        ))}
                    </div>
                    {mode === 'partial' && (
                        <div className="space-y-1">
                            <Label htmlFor="refund-amount">Amount ($)</Label>
                            <Input id="refund-amount" type="number" inputMode="decimal" min={0.01} step="0.01" max={(remaining / 100).toFixed(2)} value={dollars} onChange={(event) => setDollars(event.target.value)} />
                        </div>
                    )}
                    <div className="space-y-1">
                        <Label htmlFor="refund-reason-code">Reason</Label>
                        <select id="refund-reason-code" className="h-10 w-full border border-[var(--dashboard-border)] bg-white px-3 text-sm" value={reasonCode} onChange={(event) => setReasonCode(event.target.value)}>
                            <option value="requested_by_customer">Requested by customer</option>
                            <option value="duplicate">Duplicate charge</option>
                            <option value="fraudulent">Fraudulent</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="refund-note">Note for the record</Label>
                        <Textarea id="refund-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why this refund is being issued" />
                    </div>
                    <div className="md:col-span-2">
                        <Button type="button" variant="outline" disabled={!plan.ok || !note.trim() || pending} onClick={() => setOpen(true)}>
                            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                            Refund
                        </Button>
                        {!plan.ok && mode === 'partial' && dollars && <p className="mt-2 text-xs text-[var(--destructive)]">{plan.error}</p>}
                    </div>
                </div>
            )}

            {refunds.length > 0 && (
                <ul className="space-y-2 border-t border-[var(--dashboard-border)] pt-3 text-sm">
                    {refunds.map((row) => (
                        <li key={row.id} className="flex flex-wrap justify-between gap-2">
                            <span>
                                <span className="tabular-nums">{formatCents(row.amount_cents)}</span> · {row.status} · {row.reason}
                            </span>
                            <span className="text-xs text-[var(--dashboard-text-muted)]">
                                {row.created_by_email || 'Staff'} · {new Date(row.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' })}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <AlertDialog open={open} onOpenChange={(value) => !pending && setOpen(value)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Refund {plan.ok ? formatCents(plan.amount) : ''}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This sends the money back to the customer&apos;s card through Stripe and can&apos;t be undone.
                            {plan.ok && !plan.full ? ` ${formatCents(plan.remainingAfter)} will stay refundable.` : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={pending} onClick={(event) => { event.preventDefault(); submit() }}>
                            {pending ? 'Refunding…' : 'Confirm refund'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
