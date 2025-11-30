'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Eye, MoreVertical, Pencil, Trash2, Calendar, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/admin/search-input'
import { StatusFilter } from '@/components/admin/status-filter'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusBadge } from '@/components/ui/status-badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { formatCents } from '@/lib/format-money'
import { CreateEventDialog } from '@/components/admin/events/create-event-dialog'

interface Event {
    id: string
    event_id: string
    name: string
    event_date: string
    location: string | null
    status: string
    guest_count: number | null
    budget: number | null
    manager_name: string | null
}

function getStatusVariant(status: string): 'success' | 'pending' | 'cancelled' | 'on-hold' | 'default' {
    const statusMap: Record<string, 'success' | 'pending' | 'cancelled' | 'on-hold' | 'default'> = {
        'confirmed': 'success',
        'completed': 'default',
        'planning': 'pending',
        'pending': 'on-hold',
        'cancelled': 'cancelled',
    }
    return statusMap[status.toLowerCase()] || 'default'
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('event_date', { ascending: true })

            if (error) {
                console.error('Error fetching events:', error)
            } else {
                setEvents(data || [])
            }
            setLoading(false)
        }

        fetchEvents()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
                        <p className="text-gray-600 mt-1 text-sm">Loading events...</p>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
                    <p className="text-gray-600 mt-1 text-sm">
                        View and manage upcoming and past events
                    </p>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="all">All Events</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                    <div className="flex items-center justify-between gap-4">
                        <SearchInput placeholder="Search events..." />
                        <div className="flex items-center gap-2">
                            <StatusFilter
                                statuses={[
                                    { value: 'planning', label: 'Planning' },
                                    { value: 'confirmed', label: 'Confirmed' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                            />
                            <CreateEventDialog onSuccess={() => window.location.reload()} />
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-base font-semibold text-gray-900">All Events</h2>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox />
                                        </TableHead>
                                        <TableHead>Event Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Guests</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Manager</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                <Checkbox />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{event.name}</span>
                                                    <span className="text-xs text-gray-500">{event.event_id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(event.event_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate max-w-[200px]">{event.location || 'TBD'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-3 w-3" />
                                                    {event.guest_count || 'TBD'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                    variant={getStatusVariant(event.status)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {event.manager_name || 'Unassigned'}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm">
                                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/events/${event.id}`} className="flex items-center gap-2">
                                                                <Eye className="h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2">
                                                            <Pencil className="h-4 w-4" />
                                                            Edit Event
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="space-y-6 mt-6">
                    <div className="flex items-center justify-center h-40 bg-white rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Calendar view coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
