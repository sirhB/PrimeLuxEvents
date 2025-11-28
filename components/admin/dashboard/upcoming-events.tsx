'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const events = [
    {
        id: 1,
        title: "Emma & Liam's Wedding",
        daysLeft: 3,
        progress: 83,
        color: "bg-blue-50",
        barColor: "bg-blue-400",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam"]
    },
    {
        id: 2,
        title: "Hope for All Charity Gala",
        daysLeft: 12,
        progress: 67,
        color: "bg-cyan-50",
        barColor: "bg-cyan-400",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", "https://api.dicebear.com/7.x/avataaars/svg?seed=John"]
    },
    {
        id: 3,
        title: "Clay's Birthday Party",
        daysLeft: 18,
        progress: 48,
        color: "bg-pink-50",
        barColor: "bg-pink-400",
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Clay"]
    }
]

export function UpcomingEvents() {
    return (
        <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
                <Button variant="link" className="text-[#6366f1] font-semibold">See All</Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className={`${event.color} p-4 rounded-2xl`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex -space-x-2">
                                    {event.avatars.map((avatar, i) => (
                                        <img
                                            key={i}
                                            src={avatar}
                                            alt="Avatar"
                                            className="h-8 w-8 rounded-full border-2 border-white"
                                        />
                                    ))}
                                </div>
                                <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                                    {event.daysLeft} days left
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-4 text-sm h-10">{event.title}</h3>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{event.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${event.barColor} rounded-full`}
                                    style={{ width: `${event.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
