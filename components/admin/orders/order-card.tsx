'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Calendar, Mail, User, Hash } from 'lucide-react'
import { format } from 'date-fns'
import { formatCentsWithCommas } from '@/lib/format-money'

interface Order {
    id: string
    customer_name: string
    customer_email: string
    created_at: string
    total_amount: number
    status: string
    is_overbooked: boolean
}

interface OrderCardProps {
    order: Order
    isOverlay?: boolean
}

export function OrderCard({ order, isOverlay }: OrderCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: order.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative select-none touch-none",
                isDragging && !isOverlay && "opacity-30",
                isOverlay && "z-50"
            )}
        >
            <Card className={cn(
                "p-4 border-none glass-card bg-black/40 hover:bg-black/60 transition-all duration-300",
                "border border-white/5 hover:border-[var(--dashboard-accent-gold)]/30",
                isOverlay && "border-[var(--dashboard-accent-gold)] shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            )}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--dashboard-accent-gold)] shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                        <span className="text-[10px] font-mono font-bold text-[var(--dashboard-accent-gold)] tracking-tighter">
                            <Hash className="h-2.5 w-2.5 inline mr-0.5 opacity-50" />
                            {order.id.slice(0, 8).toUpperCase()}
                        </span>
                    </div>
                </div>

                <h4 className="font-serif text-base text-white mb-3 line-clamp-1 group-hover:text-[var(--dashboard-accent-gold)] transition-colors">
                    {order.customer_name}
                </h4>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] font-medium">
                        <Calendar className="h-3 w-3 opacity-50" />
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">Total</span>
                        <span className="text-sm font-mono font-bold text-white">
                            {formatCentsWithCommas(order.total_amount)}
                        </span>
                    </div>
                </div>

                {order.is_overbooked && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" title="Overbooked Items" />
                )}
            </Card>
        </div>
    )
}
