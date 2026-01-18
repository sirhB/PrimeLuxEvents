'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Mail, Calendar, Hash, Search, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
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

interface OrderRailProps {
    orders: Order[]
    selectedId: string | null
    onSelect: (id: string) => void
}

const statusGlows: Record<string, string> = {
    pending: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-amber-500/10 border-amber-500/20',
    confirmed: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-500/10 border-emerald-500/20',
    processing: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-blue-500/10 border-blue-500/20',
    delivered: 'hover:shadow-[0_0_15px_rgba(148,163,184,0.15)] bg-slate-500/10 border-slate-500/20',
    cancelled: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/10 border-red-500/20',
}

const statusColors: Record<string, string> = {
    pending: 'text-amber-400',
    confirmed: 'text-emerald-400',
    processing: 'text-blue-400',
    delivered: 'text-slate-400',
    cancelled: 'text-red-400',
}

const statusDots: Record<string, string> = {
    pending: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    confirmed: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    processing: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    delivered: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)]',
    cancelled: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
}

export function OrderRail({ orders, selectedId, onSelect }: OrderRailProps) {
    const [search, setSearch] = React.useState('')

    const filteredOrders = React.useMemo(() => {
        if (!search) return orders
        const s = search.toLowerCase()
        return orders.filter(o =>
            o.customer_name.toLowerCase().includes(s) ||
            o.customer_email.toLowerCase().includes(s) ||
            o.id.toLowerCase().includes(s)
        )
    }, [orders, search])

    return (
        <>
            <div className="p-4 border-b border-[var(--dashboard-border)] bg-black/20 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--dashboard-text-muted)] flex items-center justify-between">
                    Orders List
                    <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] border border-white/5">{orders.length}</span>
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search orders..."
                        className="pl-9 h-9 bg-black/40 border-white/10 rounded-xl text-xs focus-visible:ring-[var(--dashboard-accent-gold)]/50"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {filteredOrders.map((order) => {
                        const isSelected = selectedId === order.id
                        const status = order.status.toLowerCase()

                        return (
                            <button
                                key={order.id}
                                onClick={() => onSelect(order.id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-2xl transition-all duration-300 border relative group",
                                    isSelected
                                        ? "bg-[var(--dashboard-accent-gold)]/10 border-[var(--dashboard-accent-gold)]/40 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                        : "bg-transparent border-transparent hover:bg-white/5",
                                    !isSelected && statusGlows[status]
                                )}
                            >
                                {/* Status Indicator */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-1.5 w-1.5 rounded-full", statusDots[status] || 'bg-white')} />
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", statusColors[status] || 'text-white')}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[var(--dashboard-accent-gold)] font-mono text-[10px] font-bold">
                                        <Hash className="h-3 w-3 opacity-50" />
                                        {order.id.slice(0, 8).toUpperCase()}
                                    </div>
                                </div>

                                <h4 className={cn(
                                    "font-serif text-lg leading-tight truncate mb-1 transition-colors",
                                    isSelected ? "text-[var(--dashboard-accent-gold)]" : "text-[var(--dashboard-text)] group-hover:text-white"
                                )}>
                                    {order.customer_name}
                                </h4>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] font-medium">
                                            <Calendar className="h-3 w-3 opacity-50" />
                                            {format(new Date(order.created_at), 'MMM d, yyyy')}
                                        </div>
                                        <div className="text-[11px] font-mono font-bold text-white">
                                            {formatCentsWithCommas(order.total_amount)}
                                        </div>
                                    </div>
                                    {order.customer_email && (
                                        <div className="flex items-center gap-2 text-[10px] text-[var(--dashboard-text-muted)] truncate opacity-70">
                                            <Mail className="h-3 w-3 opacity-50" />
                                            {order.customer_email}
                                        </div>
                                    )}
                                </div>

                                {/* Selection indicator line */}
                                {isSelected && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-[var(--dashboard-accent-gold)] shadow-[0_0_10px_rgba(212,175,55,1)]" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </>
    )
}
