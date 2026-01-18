'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Plus,
    Package,
    Users,
    Calendar,
    MessageSquare,
    Settings,
    FileText,
    Truck,
    Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/utils/haptics'

interface QuickAction {
    label: string
    description: string
    href: string
    icon: React.ElementType
    color: 'gold' | 'green' | 'blue' | 'purple' | 'orange'
}

const quickActions: QuickAction[] = [
    {
        label: 'New Order',
        description: 'Create a new event order',
        href: '/admin/orders/new',
        icon: Plus,
        color: 'gold'
    },
    {
        label: 'Add Product',
        description: 'Add items to inventory',
        href: '/admin/products',
        icon: Package,
        color: 'green'
    },
    {
        label: 'Schedule Event',
        description: 'Plan upcoming events',
        href: '/admin/calendar',
        icon: Calendar,
        color: 'blue'
    },
    {
        label: 'Invite Team',
        description: 'Add team members',
        href: '/admin/team',
        icon: Users,
        color: 'purple'
    },
    {
        label: 'Messages',
        description: 'Check conversations',
        href: '/admin/messages',
        icon: MessageSquare,
        color: 'orange'
    },
    {
        label: 'Logistics',
        description: 'Manage deliveries',
        href: '/admin/logistics',
        icon: Truck,
        color: 'green'
    }
]

const colorClasses = {
    gold: {
        bg: 'bg-[var(--dashboard-accent-gold)]/10',
        text: 'text-[var(--dashboard-accent-gold)]',
        border: 'border-[var(--dashboard-accent-gold)]/20',
        hover: 'hover:bg-[var(--dashboard-accent-gold)]/20 hover:border-[var(--dashboard-accent-gold)]/40'
    },
    green: {
        bg: 'bg-[var(--dashboard-accent-green)]/10',
        text: 'text-[var(--dashboard-accent-green)]',
        border: 'border-[var(--dashboard-accent-green)]/20',
        hover: 'hover:bg-[var(--dashboard-accent-green)]/20 hover:border-[var(--dashboard-accent-green)]/40'
    },
    blue: {
        bg: 'bg-[var(--dashboard-accent-blue)]/10',
        text: 'text-[var(--dashboard-accent-blue)]',
        border: 'border-[var(--dashboard-accent-blue)]/20',
        hover: 'hover:bg-[var(--dashboard-accent-blue)]/20 hover:border-[var(--dashboard-accent-blue)]/40'
    },
    purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
        hover: 'hover:bg-purple-500/20 hover:border-purple-500/40'
    },
    orange: {
        bg: 'bg-[var(--dashboard-accent-orange)]/10',
        text: 'text-[var(--dashboard-accent-orange)]',
        border: 'border-[var(--dashboard-accent-orange)]/20',
        hover: 'hover:bg-[var(--dashboard-accent-orange)]/20 hover:border-[var(--dashboard-accent-orange)]/40'
    }
}

export function QuickActionsWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-6 border border-[var(--dashboard-border)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--dashboard-accent-gold)] to-[var(--dashboard-accent-gold)]/70">
                        <Sparkles className="h-5 w-5 text-black" />
                    </div>
                    <div>
                        <h3 className="text-lg font-serif font-light text-[var(--dashboard-text)]">
                            Quick Actions
                        </h3>
                        <p className="text-xs text-[var(--dashboard-text-muted)]">
                            Common tasks at your fingertips
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action, index) => {
                    const Icon = action.icon
                    const colors = colorClasses[action.color]

                    return (
                        <motion.div
                            key={action.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                        >
                            <Link href={action.href}>
                                <div
                                    onClick={() => haptics.impact()}
                                    className={cn(
                                        "group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer",
                                        colors.bg,
                                        colors.border,
                                        colors.hover,
                                        "hover:scale-105 active:scale-95"
                                    )}
                                >
                                    <div className="flex flex-col items-center text-center gap-3">
                                        <div className={cn(
                                            "p-3 rounded-xl transition-all duration-300",
                                            colors.bg,
                                            "group-hover:scale-110"
                                        )}>
                                            <Icon className={cn("h-5 w-5", colors.text)} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold mb-1 transition-colors text-[var(--dashboard-text)]">
                                                {action.label}
                                            </p>
                                            <p className="text-[10px] text-[var(--dashboard-text-muted)] leading-tight">
                                                {action.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hover glow effect */}
                                    <div className={cn(
                                        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10",
                                        colors.bg
                                    )} />
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
