'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { ChevronDown } from 'lucide-react'

interface RevenueChartProps {
    data: any[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <Card className="bg-[var(--dashboard-card)] border-none text-[var(--dashboard-text)] shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-serif font-medium">Your sales report</CardTitle>
                    <p className="text-sm text-[var(--dashboard-text-muted)]">Look at your sale</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold">$4,435.70</div>
                    <span className="text-xs font-medium text-[var(--dashboard-accent-green)] bg-[var(--dashboard-accent-green)]/10 px-2 py-1 rounded-full">
                        +2.5%
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--dashboard-accent-blue)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="var(--dashboard-accent-blue)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTotal2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--dashboard-accent-orange)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="var(--dashboard-accent-orange)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="var(--dashboard-border)" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                stroke="var(--dashboard-text-muted)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--dashboard-text-muted)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111827',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: 'var(--dashboard-text-muted)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="var(--dashboard-accent-blue)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                            <Area
                                type="monotone"
                                dataKey="total" // Using same data for demo effect, normally would be a second dataset
                                stroke="var(--dashboard-accent-orange)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal2)"
                                strokeDasharray="5 5"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
