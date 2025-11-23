import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon?: React.ElementType
    className?: string
}

export function StatsCard({ title, value, subtitle, icon: Icon, className }: StatsCardProps) {
    return (
        <Card className={cn("bg-[var(--dashboard-card)] border-none text-[var(--dashboard-text)] shadow-lg", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                    {title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-[var(--dashboard-text-muted)]" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
