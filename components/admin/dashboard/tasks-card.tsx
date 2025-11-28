'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

const tasks = [
    {
        id: 1,
        title: "Send final payment reminder",
        project: "Emma & Liam's Wedding",
        completed: false
    },
    {
        id: 2,
        title: "Confirm seating plan updates",
        project: "Emma & Liam's Wedding",
        completed: false
    },
    {
        id: 3,
        title: "Review guest list updates",
        project: "Hope for All Charity Gala",
        completed: false
    }
]

export function TasksCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
        >
            <Card className="bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-gold/5 border border-border/40 rounded-xl p-8 h-full relative overflow-hidden group transition-all duration-500 hover:shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/50 via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-6 mb-6 border-b border-border/20">
                    <div className="flex items-center gap-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium"
                        >
                            <span>Today's Tasks</span>
                            <span className="bg-gold text-black text-xs font-bold px-2 py-1 rounded-full">12</span>
                        </motion.div>
                    </div>
                    <Button variant="link" className="text-gold hover:text-gold/80 font-medium hover:bg-gold/5 px-4 py-2 rounded-lg transition-all duration-300">See All</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.map((task, index) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/30 cursor-pointer transition-all duration-300 group/item border border-transparent hover:border-gold/20"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="mt-1 h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover/item:border-gold transition-all duration-300 flex items-center justify-center"
                                >
                                    <div className="h-2 w-2 rounded-full bg-gold opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                                </motion.div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground leading-tight mb-2 group-hover/item:text-gold transition-colors duration-300">{task.title}</p>
                                    <p className="text-sm text-muted-foreground font-light">{task.project}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="mt-8 pt-6 border-t border-border/20"
                    >
                        <Button variant="ghost" className="text-gold hover:text-gold/80 hover:bg-gold/5 px-4 py-3 rounded-lg group/btn transition-all duration-300">
                            <Plus className="h-5 w-5 mr-3 group-hover/btn:rotate-90 transition-transform duration-300" />
                            <span className="font-medium">Add Task</span>
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
