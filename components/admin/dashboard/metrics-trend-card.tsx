'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

interface MetricsTrendCardProps {
    title: string
    value: string | number
    data: any[]
    trend?: string
}

export function MetricsTrendCard({ title, value, data, trend }: MetricsTrendCardProps) {
    return (
        <Card className="bg-gradient-to-br from-[var(--dashboard-accent-gold)]/20 to-[var(--dashboard-accent-blue)]/5 border-none text-[var(--dashboard-text)] shadow-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)]">
                    {title}
                </CardTitle>
                {trend && (
                    <span className="text-xs font-medium bg-[var(--dashboard-card)]/50 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold mb-4">{value}</div>
                <div className="h-[100px] w-full -mx-6 -mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--dashboard-accent-gold)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--dashboard-accent-gold)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--dashboard-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--dashboard-text)' }}
                                cursor={{ stroke: 'var(--dashboard-accent-gold)', strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--dashboard-accent-gold)"
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
