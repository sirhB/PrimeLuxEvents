'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Video, Calendar as CalendarIcon, Clock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Appointment {
    id: string
    title?: string
    client_name: string
    appointment_date: string
    appointment_time: string
    location: string
    status: string
}

export function MeetingsCard() {
    const [meetings, setMeetings] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchMeetings() {
            try {
                const today = new Date().toISOString().split('T')[0]
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*')
                    .gte('appointment_date', today)
                    .eq('status', 'scheduled')
                    .order('appointment_date', { ascending: true })
                    .order('appointment_time', { ascending: true })
                    .limit(5)

                if (error) throw error
                if (data) setMeetings(data)
            } catch (error) {
                console.error('Error fetching meetings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchMeetings()
    }, [])

    return (
        <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl bg-white h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Video className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-serif font-light tracking-tight">Today's Meetings</CardTitle>
                        <p className="text-xs text-muted-foreground font-light">Your upcoming schedule</p>
                    </div>
                </div>
                <Link href="/admin/appointments">
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full font-medium">
                        See All
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarIcon className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-light">No meetings scheduled for today.</p>
                        </div>
                    ) : (
                        meetings.map((meeting) => (
                            <div key={meeting.id} className="group relative flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-tighter">
                                        {new Date(meeting.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                    <span className="text-lg font-serif font-bold leading-none">
                                        {new Date(meeting.appointment_date).getDate()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">
                                        {meeting.title || `Meeting with ${meeting.client_name}`}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-light">
                                            <Clock className="h-3 w-3" />
                                            {meeting.appointment_time}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-light">
                                            <User className="h-3 w-3" />
                                            {meeting.client_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                        <ArrowRight className="h-4 w-4 text-indigo-600" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Link href="/admin/appointments">
                    <Button variant="outline" className="w-full mt-8 rounded-xl border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 transition-all duration-300">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

import { ArrowRight } from 'lucide-react'
