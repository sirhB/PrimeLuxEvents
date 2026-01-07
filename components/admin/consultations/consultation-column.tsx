'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ConsultationColumnProps {
    title: string
    subtitle: string
    count: number
    accentClass?: string
    children: ReactNode
}

export function ConsultationColumn({
    title,
    subtitle,
    count,
    accentClass,
    children,
}: ConsultationColumnProps) {
    return (
        <motion.section
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'rounded-3xl border-none glass-card px-4 py-5 flex flex-col gap-4 h-full min-h-[500px]',
                accentClass
            )}
        >
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-[var(--dashboard-border)] mb-2">
                <div>
                    <p className="text-sm font-serif font-bold tracking-widest uppercase text-[var(--dashboard-text)]">{title}</p>
                    <p className="text-[10px] text-[var(--dashboard-text-muted)] font-medium uppercase tracking-wider">{subtitle}</p>
                </div>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] text-xs font-bold border border-[var(--dashboard-accent-gold)]/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                    {count}
                </span>
            </div>
            <motion.div layout className="flex flex-col gap-4">
                {children}
            </motion.div>
        </motion.section>
    )
}

