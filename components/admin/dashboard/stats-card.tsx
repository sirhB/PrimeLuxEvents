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
                    "bg-[var(--dashboard-card)] border-none text-[var(--dashboard-text)] shadow-lg",
                    "hover:shadow-xl hover:shadow-[var(--dashboard-accent-gold)]/20 transition-all duration-300",
                    "relative overflow-hidden",
                    className
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--dashboard-accent-gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                        {title}
                    </CardTitle>
                    {Icon && (
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            <Icon className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                        </motion.div>
                    )}
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-2xl font-bold">
                        {value}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">
                            {subtitle}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
