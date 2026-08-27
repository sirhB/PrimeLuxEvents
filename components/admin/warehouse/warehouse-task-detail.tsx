'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    Package,
    Truck,
    QrCode,
    FileText,
    CheckCircle2,
    Loader2,
    ExternalLink,
    ShoppingBag,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    completeWarehouseTask,
    updateChecklistItem,
    updateWarehouseTaskStatus,
} from '@/app/admin/warehouse/actions'
import {
    WAREHOUSE_CATEGORY_LABELS,
    type WarehouseTask,
    type WarehouseCategory,
} from '@/lib/warehouse/types'

interface WarehouseTaskDetailProps {
    task: WarehouseTask
    onUpdate?: () => void
}

export function WarehouseTaskDetail({ task, onUpdate }: WarehouseTaskDetailProps) {
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState<string | null>(null)
    const category = (task.warehouse_category || 'general') as WarehouseCategory
    const checklist = Array.isArray(task.checklist) ? task.checklist : []
    const isComplete = task.status === 'completed'

    async function handleChecklistToggle(itemId: string, completed: boolean) {
        setLoading(itemId)
        const result = await updateChecklistItem(task.id, itemId, completed)
        setLoading(null)
        if (result.success) {
            onUpdate?.()
        } else {
            toast.error(result.error || 'Failed to update checklist')
        }
    }

    async function handleComplete() {
        setLoading('complete')
        const result = await completeWarehouseTask(task.id, notes || undefined)
        setLoading(null)
        if (result.success) {
            toast.success('Task completed')
            onUpdate?.()
        } else {
            toast.error(result.error || 'Failed to complete task')
        }
    }

    async function handleStart() {
        setLoading('start')
        const result = await updateWarehouseTaskStatus(task.id, 'in_progress')
        setLoading(null)
        if (result.success) {
            onUpdate?.()
        } else {
            toast.error(result.error || 'Failed to start task')
        }
    }

    const scanUrl = task.order_id
        ? `/admin/scan?mode=picking&orderId=${task.order_id}&taskId=${task.id}`
        : '/admin/scan?mode=picking'

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Badge variant="outline" className="mb-2 text-[10px] uppercase">
                    {WAREHOUSE_CATEGORY_LABELS[category]}
                </Badge>
                <h2 className="text-2xl font-serif font-light text-[var(--dashboard-text)]">{task.title}</h2>
                {task.description && (
                    <p className="text-sm text-[var(--dashboard-text-muted)] mt-2">{task.description}</p>
                )}
            </div>

            {task.orders && (
                <div className="glass-card rounded-2xl p-4 space-y-2">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--dashboard-text-muted)]">
                        Linked Order
                    </h3>
                    <p className="font-medium text-[var(--dashboard-text)]">{task.orders.customer_name}</p>
                    {task.orders.delivery_address && (
                        <p className="text-sm text-[var(--dashboard-text-muted)]">{task.orders.delivery_address}</p>
                    )}
                    <div className="flex gap-2 text-xs text-[var(--dashboard-text-muted)]">
                        {task.orders.delivery_date && <span>Delivery: {task.orders.delivery_date}</span>}
                        {task.orders.delivery_time && <span>· {task.orders.delivery_time}</span>}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {task.order_id && (
                    <>
                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                            <Link href={`/admin/pack-slip?date=${task.orders?.delivery_date || ''}`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Pack Slip
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                            <Link href={`/admin/orders/${task.order_id}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Order
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                            <Link href={`/admin/orders/${task.order_id}#bags`}>
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Assign Bags
                            </Link>
                        </Button>
                    </>
                )}
                {(category === 'pick' || category === 'pack') && (
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link href={scanUrl}>
                            <QrCode className="h-4 w-4 mr-2" />
                            Open Scanner
                        </Link>
                    </Button>
                )}
                {category === 'vehicle_load' && task.order_id && (
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link href="/admin/delivery">
                            <Truck className="h-4 w-4 mr-2" />
                            Delivery Planner
                        </Link>
                    </Button>
                )}
            </div>

            {checklist.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--dashboard-text-muted)] flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Checklist ({checklist.filter((i) => i.completed).length}/{checklist.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {checklist.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                                    item.completed
                                        ? 'bg-[var(--dashboard-accent-green)]/5 border-[var(--dashboard-accent-green)]/20'
                                        : 'border-[var(--dashboard-border)] hover:bg-black/10'
                                )}
                            >
                                {loading === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Checkbox
                                        checked={item.completed}
                                        disabled={isComplete}
                                        onCheckedChange={(checked) =>
                                            handleChecklistToggle(item.id, checked === true)
                                        }
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={cn('text-sm font-medium', item.completed && 'line-through opacity-60')}>
                                        {item.label}
                                    </p>
                                    {item.qty && (
                                        <p className="text-xs text-[var(--dashboard-text-muted)]">Qty: {item.qty}</p>
                                    )}
                                </div>
                                {item.completed && <CheckCircle2 className="h-4 w-4 text-[var(--dashboard-accent-green)]" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isComplete && (
                <div className="space-y-4 pt-4 border-t border-[var(--dashboard-border)]">
                    {task.status === 'pending' && (
                        <Button
                            onClick={handleStart}
                            disabled={loading === 'start'}
                            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                        >
                            {loading === 'start' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Start Task
                        </Button>
                    )}
                    <Textarea
                        placeholder="Completion notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="rounded-xl bg-black/10 border-[var(--dashboard-border)]"
                    />
                    <Button
                        onClick={handleComplete}
                        disabled={loading === 'complete'}
                        className="w-full rounded-xl bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black"
                    >
                        {loading === 'complete' ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Mark Complete
                    </Button>
                </div>
            )}

            {isComplete && task.completion_notes && (
                <div className="glass-card rounded-xl p-4">
                    <p className="text-xs uppercase tracking-widest text-[var(--dashboard-text-muted)] mb-1">Notes</p>
                    <p className="text-sm">{task.completion_notes}</p>
                </div>
            )}
        </div>
    )
}
