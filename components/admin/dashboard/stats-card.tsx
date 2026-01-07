'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon?: React.ElementType
    className?: string
    index?: number
}

export function StatsCard({ title, value, subtitle, icon: Icon, className, index = 0 }: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Card
                animate={false}
                className={cn(
                    "glass-card border-none text-[var(--dashboard-text)]",
                    "hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 group",
                    "flex items-center p-6 gap-6 overflow-hidden relative",
                    className
                )}
            >
                {/* Decorative background glow */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--dashboard-accent-gold)]/5 rounded-full blur-3xl group-hover:bg-[var(--dashboard-accent-gold)]/10 transition-colors duration-500" />

                {Icon && (
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--dashboard-accent-gold)]/20 to-[var(--dashboard-accent-gold)]/5 flex items-center justify-center shrink-0 border border-[var(--dashboard-accent-gold)]/10 group-hover:border-[var(--dashboard-accent-gold)]/30 transition-colors duration-500 shadow-lg">
                        <Icon className="h-7 w-7 text-[var(--dashboard-accent-gold)] transition-transform duration-500 group-hover:scale-110" />
                    </div>
                )}
                <div className="flex flex-col relative z-10">
                    <span className="text-xs text-[var(--dashboard-text-muted)] font-bold uppercase tracking-wider mb-1">
                        {title}
                    </span>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-light text-[var(--dashboard-text)] font-serif tracking-tight">
                            {value}
                        </span>
                        {subtitle && (
                            <span className="text-[10px] font-bold text-[var(--dashboard-accent-green)] bg-[var(--dashboard-accent-green)]/10 px-2 py-0.5 rounded-full border border-[var(--dashboard-accent-green)]/20 mb-1">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
