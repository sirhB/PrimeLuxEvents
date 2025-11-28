'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

const data = [
    { name: "Emma & Liam's Wedding", value: 35, color: '#60a5fa' }, // Blue
    { name: "Hope for All Charity Gala", value: 25, color: '#38bdf8' }, // Light Blue
    { name: "Clay's Birthday Party", value: 20, color: '#f472b6' }, // Pink
    { name: "Brann's Birthday Party", value: 20, color: '#fb923c' }, // Orange
]

export function ProjectsWorkedCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
        >
            <Card className="bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-gold/5 border border-border/40 rounded-xl p-8 h-full relative overflow-hidden group transition-all duration-500 hover:shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/50 via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-6 mb-6 border-b border-border/20">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium"
                    >
                        <span>Projects Worked</span>
                    </motion.div>
                    <Button variant="link" className="text-gold hover:text-gold/80 font-medium hover:bg-gold/5 px-4 py-2 rounded-lg transition-all duration-300">See All</Button>
                </CardHeader>
                <CardContent className="flex items-center gap-8">
                    <div className="h-[220px] w-[220px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(212, 175, 55, 0.2)',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(212, 175, 55, 0.05)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                        >
                            <div className="text-4xl font-serif font-light text-foreground mb-1">4</div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider font-light">events</div>
                        </motion.div>
                    </div>
                    <div className="flex-1">
                        <ul className="flex flex-col gap-4">
                            {data.map((entry, index) => (
                                <motion.li
                                    key={`item-${index}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + (index * 0.1) }}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-all duration-300 group/item cursor-pointer"
                                >
                                    <motion.span
                                        whileHover={{ scale: 1.2 }}
                                        className="h-3 w-3 rounded-full flex-shrink-0 shadow-sm"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-sm font-light text-muted-foreground group-hover/item:text-foreground transition-colors truncate">{entry.name}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
