'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Rocket,
    CheckCircle2,
    Circle,
    ChevronRight,
    AlertCircle,
    Settings,
    CreditCard,
    Package,
    Users
} from 'lucide-react'
import { useReadiness } from '../readiness-provider'
import { cn } from '@/lib/utils'

const READINESS_ITEMS = [
    {
        key: 'settings_reviewed' as const,
        label: 'Review Settings',
        description: 'Configure your business details and preferences',
        icon: Settings,
        href: '/admin/settings'
    },
    {
        key: 'stripe_verified' as const,
        label: 'Verify Stripe Integration',
        description: 'Ensure payment processing is configured',
        icon: CreditCard,
        href: '/admin/settings#payments'
    },
    {
        key: 'products_verified' as const,
        label: 'Verify Products',
        description: 'Review and confirm your product catalog',
        icon: Package,
        href: '/admin/products'
    },
    {
        key: 'team_invited' as const,
        label: 'Invite Team Members',
        description: 'Add your team to collaborate',
        icon: Users,
        href: '/admin/team'
    }
]

export function LaunchReadinessTracker() {
    const { readinessItems, updateReadinessItem, progress, isComplete } = useReadiness()

    const handleItemClick = async (item: typeof READINESS_ITEMS[0]) => {
        // Navigate to the relevant page
        window.location.href = item.href
    }

    const handleMarkComplete = async (item: typeof READINESS_ITEMS[0], e: React.MouseEvent) => {
        e.stopPropagation()
        await updateReadinessItem(item.key, !readinessItems[item.key])
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden group border-[var(--dashboard-accent-gold)]/20"
        >
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                            <Rocket className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-light text-[var(--dashboard-text)]">Launch Readiness</h2>
                            <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
                                Complete these essential steps before going live.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-3xl font-serif font-light text-[var(--dashboard-accent-gold)] tabular-nums">
                                {progress}%
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--dashboard-text-muted)] font-bold">
                                Complete
                            </div>
                        </div>
                        <div className="h-12 w-[1px] bg-[var(--dashboard-border)] hidden md:block" />
                        {isComplete ? (
                            <div className="px-4 py-2 rounded-full bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)] text-sm font-medium flex items-center gap-2 border border-[var(--dashboard-accent-green)]/20">
                                <CheckCircle2 className="h-4 w-4" />
                                Ready for Launch
                            </div>
                        ) : (
                            <div className="px-4 py-2 rounded-full bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] text-sm font-medium flex items-center gap-2 border border-[var(--dashboard-accent-gold)]/20">
                                <AlertCircle className="h-4 w-4" />
                                {READINESS_ITEMS.length - Object.values(readinessItems).filter(Boolean).length} Steps Remaining
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {READINESS_ITEMS.map((item, index) => {
                        const isDone = readinessItems[item.key]
                        const Icon = item.icon

                        return (
                            <div
                                key={item.key}
                                onClick={() => handleItemClick(item)}
                                role="button"
                                tabIndex={0}
                                className={cn(
                                    "flex flex-col gap-3 p-4 rounded-2xl transition-all duration-300 text-left border relative group/item cursor-pointer",
                                    isDone
                                        ? "bg-[var(--dashboard-accent-green)]/5 border-[var(--dashboard-accent-green)]/20"
                                        : "bg-white/5 border-[var(--dashboard-border)] hover:bg-white/10 hover:border-[var(--dashboard-accent-gold)]/30"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <Icon className={cn(
                                        "h-5 w-5 shrink-0",
                                        isDone ? "text-[var(--dashboard-accent-green)]" : "text-[var(--dashboard-text-muted)]"
                                    )} />
                                    <button
                                        onClick={(e) => handleMarkComplete(item, e)}
                                        className="transition-all hover:scale-110"
                                    >
                                        {isDone ? (
                                            <CheckCircle2 className="h-5 w-5 text-[var(--dashboard-accent-green)]" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-[var(--dashboard-border)] hover:text-[var(--dashboard-accent-gold)]" />
                                        )}
                                    </button>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-[var(--dashboard-text)] mb-1">{item.label}</div>
                                    <div className="text-xs text-[var(--dashboard-text-muted)] leading-relaxed">{item.description}</div>
                                </div>

                                {!isDone && (
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <ChevronRight className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Main Progress Bar */}
                <div className="mt-8 relative h-2 w-full bg-[var(--dashboard-border)] rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--dashboard-accent-gold)] to-[var(--dashboard-accent-gold-bright,var(--dashboard-accent-gold))] shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                    />
                </div>
            </div>
        </motion.div>
    )
}
