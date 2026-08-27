'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Package, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    WAREHOUSE_CATEGORY_LABELS,
    type WarehouseTask,
    type WarehouseCategory,
} from '@/lib/warehouse/types'

interface WarehouseTaskCardProps {
    task: WarehouseTask
    selected?: boolean
    onClick?: () => void
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

export function WarehouseTaskCard({ task, selected, onClick, compact }: WarehouseTaskCardProps) {
    const category = (task.warehouse_category || 'general') as WarehouseCategory
    const checklist = task.checklist || []
    const completedCount = checklist.filter((i) => i.completed).length
    const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : null

    return (
        <Card
            className={cn(
                'glass-card border-[var(--dashboard-border)] cursor-pointer transition-all hover:border-[var(--dashboard-accent-gold)]/30',
                selected && 'border-[var(--dashboard-accent-gold)]/50 ring-1 ring-[var(--dashboard-accent-gold)]/20'
            )}
            onClick={onClick}
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

                <h4 className={cn('font-medium text-[var(--dashboard-text)] mb-1', compact ? 'text-sm line-clamp-1' : 'line-clamp-2')}>
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
                        {task.scheduled_start && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.scheduled_start.slice(0, 5)}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assigned_to_text || 'Warehouse team'}
                        </span>
                    </div>
                    {progress !== null && (
                        <span className="flex items-center gap-1 text-[10px] text-[var(--dashboard-text-muted)]">
                            <Package className="h-3 w-3" />
                            {completedCount}/{checklist.length}
                        </span>
                    )}
                    {!compact && <ChevronRight className="h-4 w-4 text-[var(--dashboard-text-muted)]" />}
                </div>

                {progress !== null && !compact && (
                    <div className="mt-2 h-1 bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[var(--dashboard-accent-gold)] transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
