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
                    "bg-[var(--dashboard-card)] border-none text-[var(--dashboard-text)] shadow-sm",
                    "hover:shadow-md transition-all duration-300",
                    "flex items-center p-4 gap-4",
                    className
                )}
            >
                {Icon && (
                    <div className="h-12 w-12 rounded-full bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center shrink-0">
                        <Icon className="h-6 w-6 text-[var(--dashboard-accent-gold)]" />
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="text-sm text-[var(--dashboard-text-muted)] font-medium font-sans">
                        {title}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[var(--dashboard-text)] font-serif">
                            {value}
                        </span>
                        {subtitle && (
                            <span className="text-xs font-medium text-[var(--dashboard-accent-green)] bg-[var(--dashboard-accent-green)]/10 px-1.5 py-0.5 rounded-full">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
