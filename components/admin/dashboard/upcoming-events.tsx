'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const events = [
    {
        id: 1,
        title: "Emma & Liam's Wedding",
        daysLeft: 3,
        progress: 83,
        color: "bg-blue-50/50 hover:bg-blue-50",
        barColor: "bg-blue-400",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam"]
    },
    {
        id: 2,
        title: "Hope for All Charity Gala",
        daysLeft: 12,
        progress: 67,
        color: "bg-cyan-50/50 hover:bg-cyan-50",
        barColor: "bg-cyan-400",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", "https://api.dicebear.com/7.x/avataaars/svg?seed=John"]
    },
    {
        id: 3,
        title: "Clay's Birthday Party",
        daysLeft: 18,
        progress: 48,
        color: "bg-pink-50/50 hover:bg-pink-50",
        barColor: "bg-pink-400",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Clay"]
    }
]

export function UpcomingEvents() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="h-full"
        >
            <Card className="bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-gold/5 border border-border/40 rounded-xl p-8 h-full relative overflow-hidden group transition-all duration-500 hover:shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/50 via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-6 mb-6 border-b border-border/20">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium"
                    >
                        <span>Upcoming Events</span>
                    </motion.div>
                    <Button variant="link" className="text-gold hover:text-gold/80 font-medium hover:bg-gold/5 px-4 py-2 rounded-lg transition-all duration-300">See All</Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {events.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                whileHover={{ y: -5 }}
                                className={`${event.color} p-6 rounded-xl transition-all duration-300 cursor-pointer border border-border/30 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10 backdrop-blur-sm`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex -space-x-2">
                                        {event.avatars.map((avatar, i) => (
                                            <motion.img
                                                key={i}
                                                src={avatar}
                                                alt="Avatar"
                                                whileHover={{ scale: 1.1 }}
                                                className="h-8 w-8 rounded-full border-2 border-white shadow-md hover:shadow-gold/20 transition-shadow duration-300"
                                            />
                                        ))}
                                    </div>
                                    <span className="bg-background/80 backdrop-blur-sm text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm border border-border/20">
                                        {event.daysLeft} days left
                                    </span>
                                </div>
                                <h3 className="font-serif font-medium text-foreground mb-6 text-base leading-tight h-12 overflow-hidden">{event.title}</h3>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 font-light">
                                    <span>Progress</span>
                                    <span className="font-medium">{event.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${event.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.2, delay: 0.3 + (index * 0.1), ease: "easeOut" }}
                                        className={`h-full ${event.barColor} rounded-full shadow-sm`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
