'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Video } from 'lucide-react'

const meetings = [
    {
        id: 1,
        title: "Seating Plan Approval Meeting",
        time: "10:00 AM – 10:30 AM",
        attendee: "Venue Coordinator – Sophia Reynolds",
        type: "google-meet",
        iconColor: "text-green-500"
    },
    {
        id: 2,
        title: "Initial Planning Call for Brann's Birthday Party",
        time: "10:45 AM – 11:15 AM",
        attendee: "Client – Brann Callahan",
        type: "zoom",
        iconColor: "text-blue-500"
    }
]

export function MeetingsCard() {
    return (
        <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">Today's Meetings</CardTitle>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">5</span>
                </div>
                <Button variant="link" className="text-[#6366f1] font-semibold">See All</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {meetings.map((meeting) => (
                        <div key={meeting.id} className="flex items-start gap-3">
                            <div className={`mt-1 p-1.5 rounded-lg bg-gray-50 ${meeting.iconColor}`}>
                                <Video className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 leading-tight mb-1">{meeting.title}</p>
                                <p className="text-xs text-gray-500 mb-1">{meeting.time}</p>
                                <p className="text-sm text-gray-600">{meeting.attendee}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Button variant="ghost" className="mt-6 text-[#6366f1] hover:text-[#5558dd] hover:bg-indigo-50 pl-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                </Button>
            </CardContent>
        </Card>
    )
}
