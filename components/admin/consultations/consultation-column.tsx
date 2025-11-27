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
                'rounded-lg border bg-card/70 backdrop-blur px-4 py-5 shadow-sm flex flex-col gap-4 h-full',
                accentClass
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold tracking-tight">{title}</p>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm font-semibold">
                    {count}
                </span>
            </div>
            <motion.div layout className="flex flex-col gap-3">
                {children}
            </motion.div>
        </motion.section>
    )
}

