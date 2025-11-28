'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const data = [
    { name: "Emma & Liam's Wedding", value: 35, color: '#60a5fa' }, // Blue
    { name: "Hope for All Charity Gala", value: 25, color: '#38bdf8' }, // Light Blue
    { name: "Clay's Birthday Party", value: 20, color: '#f472b6' }, // Pink
    { name: "Brann's Birthday Party", value: 20, color: '#fb923c' }, // Orange
]

const renderLegend = (props: any) => {
    const { payload } = props;
    return (
        <ul className="flex flex-col gap-2 text-xs text-gray-600">
            {payload.map((entry: any, index: number) => (
                <li key={`item-${index}`} className="flex items-center gap-2">
                    <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    {entry.value}
                </li>
            ))}
        </ul>
    );
}

export function ProjectsWorkedCard() {
    return (
        <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Projects Worked</CardTitle>
                <Button variant="link" className="text-[#6366f1] font-semibold">See All</Button>
            </CardHeader>
            <CardContent className="flex items-center">
                <div className="h-[200px] w-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-2xl font-bold text-gray-900">4</div>
                        <div className="text-xs text-gray-500">events</div>
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <ul className="flex flex-col gap-3 text-xs text-gray-600">
                        {data.map((entry, index) => (
                            <li key={`item-${index}`} className="flex items-center gap-2">
                                <span
                                    className="h-2 w-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="truncate">{entry.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
