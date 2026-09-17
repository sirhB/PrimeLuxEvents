'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, User, Package, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    WAREHOUSE_CATEGORY_LABELS,
    type WarehouseTask,
    type WarehouseCategory,
} from '@/lib/warehouse/types'
import {
    completeWarehouseTask,
    updateWarehouseTaskStatus,
} from '@/app/admin/warehouse/actions'
import { assertOnline } from '@/components/admin/needs-connection'

interface WarehouseTaskCardProps {
    task: WarehouseTask
    selected?: boolean
    onClick?: () => void
    onUpdated?: () => void
    compact?: boolean
}

const categoryColors: Record<WarehouseCategory, string> = {
    pick: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    pack: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    vehicle_load: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    put_away: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    inventory_maintenance: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    returns_checkin: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    location_audit: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const statusColors: Record<string, string> = {
    pending: 'text-[var(--dashboard-text-muted)]',
    in_progress: 'text-blue-400',
    completed: 'text-[var(--dashboard-accent-green)]',
    cancelled: 'text-red-400',
}

export function WarehouseTaskCard({
    task,
    selected,
    onClick,
    onUpdated,
    compact,
}: WarehouseTaskCardProps) {
    const [busy, setBusy] = useState(false)
    const category = (task.warehouse_category || 'general') as WarehouseCategory
    const checklist = Array.isArray(task.checklist) ? task.checklist : []
    const completedCount = checklist.filter((i) => i.completed).length
    const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : null

    const primaryLabel =
        task.status === 'pending' ? 'Start' : task.status === 'in_progress' ? 'Complete' : null

    const onPrimary = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (
            !assertOnline(() =>
                toast.error('Needs connection', {
                    description: 'Reconnect to update warehouse tasks.',
                }),
            )
        ) {
            return
        }
        if (!primaryLabel) return
        setBusy(true)
        try {
            if (task.status === 'pending') {
                const result = await updateWarehouseTaskStatus(task.id, 'in_progress')
                if (!result.success) throw new Error(result.error || 'Failed to start')
                toast.success('Task started')
            } else {
                const result = await completeWarehouseTask(task.id)
                if (!result.success) throw new Error(result.error || 'Failed to complete')
                toast.success('Task completed')
            }
            onUpdated?.()
        } catch (err: any) {
            toast.error(err?.message || 'Could not update task')
        } finally {
            setBusy(false)
        }
    }

    return (
        <Card
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={
                onClick
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onClick()
                          }
                      }
                    : undefined
            }
            aria-pressed={onClick ? selected : undefined}
            aria-label={onClick ? `Select task: ${task.title}` : undefined}
            className={cn(
                'glass-card border-[var(--dashboard-border)] transition-all min-h-[4.5rem]',
                onClick && 'cursor-pointer hover:border-[var(--dashboard-accent-gold)]/30',
                selected && 'border-[var(--dashboard-accent-gold)]/50 ring-1 ring-[var(--dashboard-accent-gold)]/20',
            )}
            onClick={onClick}
            animate={false}
        >
            <CardContent className={cn('p-4', compact && 'p-3')}>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                        variant="outline"
                        className={cn('text-[10px] uppercase tracking-wider', categoryColors[category])}
                    >
                        {WAREHOUSE_CATEGORY_LABELS[category]}
                    </Badge>
                    <span className={cn('text-[10px] uppercase font-medium', statusColors[task.status])}>
                        {task.status.replace('_', ' ')}
                    </span>
                </div>

                <h4
                    className={cn(
                        'font-medium text-[var(--dashboard-text)] mb-1',
                        compact ? 'text-sm line-clamp-1' : 'line-clamp-2',
                    )}
                >
                    {task.title}
                </h4>

                {task.orders && (
                    <p className="text-xs text-[var(--dashboard-text-muted)] mb-2 truncate">
                        {task.orders.customer_name}
                        {task.orders.delivery_time && ` · ${task.orders.delivery_time}`}
                    </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--dashboard-border)]">
                    <div className="flex items-center gap-3 text-[10px] text-[var(--dashboard-text-muted)]">
                        {task.scheduled_start && typeof task.scheduled_start === 'string' && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" aria-hidden />
                                {task.scheduled_start.slice(0, 5)}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" aria-hidden />
                            {task.assigned_to_text || 'Warehouse team'}
                        </span>
                    </div>
                    {progress !== null && (
                        <span className="flex items-center gap-1 text-[10px] text-[var(--dashboard-text-muted)]">
                            <Package className="h-3 w-3" aria-hidden />
                            {completedCount}/{checklist.length}
                        </span>
                    )}
                    {!compact && !primaryLabel && (
                        <ChevronRight className="h-4 w-4 text-[var(--dashboard-text-muted)]" aria-hidden />
                    )}
                </div>

                {progress !== null && !compact && (
                    <div className="mt-2 h-1 bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--dashboard-accent-gold)] transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {primaryLabel && (
                    <Button
                        type="button"
                        disabled={busy}
                        onClick={onPrimary}
                        className="mt-3 w-full h-12 text-sm font-semibold bg-[var(--dashboard-accent-gold)] text-[#121110] hover:bg-[var(--dashboard-accent-gold)]/90"
                    >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : primaryLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
