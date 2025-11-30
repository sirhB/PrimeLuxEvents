import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Event {
    id: string
    name: string
    event_date: string
    status: string
    guest_count: number | null
    customer_name: string | null
}

function getProgressColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-green-50'
        case 'planning':
            return 'bg-blue-50'
        case 'pending':
            return 'bg-yellow-50'
        case 'completed':
            return 'bg-gray-50'
        case 'cancelled':
            return 'bg-red-50'
        default:
            return 'bg-gray-50'
    }
}

function getBarColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-green-400'
        case 'planning':
            return 'bg-blue-400'
        case 'pending':
            return 'bg-yellow-400'
        case 'completed':
            return 'bg-gray-400'
        case 'cancelled':
            return 'bg-red-400'
        default:
            return 'bg-gray-400'
    }
}

function calculateProgress(event: Event): number {
    const today = new Date()
    const eventDate = new Date(event.event_date)
    const daysTotal = 90 // Assume 90 days preparation period
    const daysLeft = Math.max(0, Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    const progress = Math.max(0, Math.min(100, ((daysTotal - daysLeft) / daysTotal) * 100))

    // Adjust based on status
    if (event.status === 'completed') return 100
    if (event.status === 'confirmed') return Math.max(progress, 80)
    if (event.status === 'planning') return Math.max(progress, 30)
    return progress
}

export async function UpcomingEvents() {
    const supabase = await createClient()

    const { data: events } = await supabase
        .from('events')
        .select('id, name, event_date, status, guest_count, customer_name')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(3)

    if (!events || events.length === 0) {
        return (
            <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
                    <Button variant="link" className="text-[#6366f1] font-semibold" asChild>
                        <Link href="/admin/events">See All</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No upcoming events found.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/admin/events">View All Events</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
                <Button variant="link" className="text-[#6366f1] font-semibold" asChild>
                    <Link href="/admin/events">See All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {events.map((event) => {
                        const daysLeft = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        const progress = calculateProgress(event)

                        return (
                            <Link key={event.id} href={`/admin/events/${event.id}`}>
                                <div className={`${getProgressColor(event.status)} p-4 rounded-2xl hover:shadow-md transition-shadow cursor-pointer`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex -space-x-2">
                                            {/* Generate avatars based on customer name */}
                                            {event.customer_name ? (
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(event.customer_name)}`}
                                                    alt="Customer Avatar"
                                                    className="h-8 w-8 rounded-full border-2 border-white"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center">
                                                    <span className="text-xs text-gray-600">?</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                                            {daysLeft >= 0 ? `${daysLeft} days left` : 'Past due'}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-4 text-sm h-10 line-clamp-2">{event.name}</h3>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getBarColor(event.status)} rounded-full transition-all duration-300`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        {event.guest_count ? `${event.guest_count} guests` : 'Guest count TBD'}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
