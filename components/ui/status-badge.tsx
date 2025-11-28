import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: string
    variant?: 'success' | 'pending' | 'cancelled' | 'on-hold' | 'refunded' | 'paid' | 'default'
    className?: string
}

const statusConfig = {
    success: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500'
    },
    pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        dot: 'bg-amber-500'
    },
    cancelled: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        dot: 'bg-red-500'
    },
    'on-hold': {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        dot: 'bg-gray-500'
    },
    refunded: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        dot: 'bg-purple-500'
    },
    paid: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500'
    },
    default: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        dot: 'bg-gray-500'
    }
}

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
    const config = statusConfig[variant] || statusConfig.default

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
            config.bg,
            config.text,
            className
        )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
            {status}
        </span>
    )
}
