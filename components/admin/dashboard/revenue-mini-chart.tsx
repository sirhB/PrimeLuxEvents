'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export function RevenueMiniChart() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const { data } = await supabase
                .from('view_revenue_daily')
                .select('*')
                .limit(7)
                .order('date', { ascending: true })

            if (data) {
                setData(data.map(d => ({
                    ...d,
                    formattedDate: format(new Date(d.date), 'EEE'),
                    revenue: d.total_revenue / 100
                })))
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) return (
        <Card className="glass-card border-none h-[180px] flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </Card>
    )

    return (
        <Card className="glass-card border-none overflow-hidden group">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-400">7-Day Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-gold opacity-50" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
                <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="miniRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none' }}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#D4AF37"
                                strokeWidth={2}
                                fill="url(#miniRev)"
                                dot={{ r: 2, fill: '#D4AF37' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
