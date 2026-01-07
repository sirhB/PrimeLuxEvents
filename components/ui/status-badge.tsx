import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: string
    variant?: 'success' | 'pending' | 'cancelled' | 'on-hold' | 'refunded' | 'paid' | 'info' | 'default'
    className?: string
}

const statusConfig = {
    success: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        border: 'border-emerald-500/20'
    },
    pending: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        border: 'border-amber-500/20'
    },
    cancelled: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        dot: 'bg-red-400',
        border: 'border-red-500/20'
    },
    'on-hold': {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-400',
        dot: 'bg-zinc-400',
        border: 'border-zinc-500/20'
    },
    refunded: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        dot: 'bg-purple-400',
        border: 'border-purple-500/20'
    },
    paid: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        border: 'border-emerald-500/20'
    },
    info: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        dot: 'bg-blue-400',
        border: 'border-blue-500/20'
    },
    default: {
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-400',
        dot: 'bg-zinc-400',
        border: 'border-zinc-500/20'
    }
}

function getVariantFromStatus(status: string): keyof typeof statusConfig {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'delivered' || s === 'paid' || s === 'success' || s === 'active') return 'success'
    if (s === 'pending' || s === 'waiting' || s === 'processing') return 'pending'
    if (s === 'in_progress' || s === 'shipping') return 'info'
    if (s === 'cancelled' || s === 'failed' || s === 'urgent') return 'cancelled'
    if (s === 'on-hold' || s === 'paused') return 'on-hold'
    if (s === 'refunded') return 'refunded'
    return 'default'
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
    const activeVariant = variant || getVariantFromStatus(status)
    const config = statusConfig[activeVariant] || statusConfig.default

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            config.bg,
            config.text,
            config.border,
            className
        )}>
            <span className={cn("w-1 h-1 rounded-full", config.dot)} />
            {status.replace('_', ' ')}
        </span>
    )
}
