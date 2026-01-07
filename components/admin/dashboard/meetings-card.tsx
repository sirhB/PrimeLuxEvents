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
        <Card className="border-none glass-card rounded-3xl h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[var(--dashboard-border)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--dashboard-accent-blue)]/10 flex items-center justify-center">
                        <Video className="h-5 w-5 text-[var(--dashboard-accent-blue)]" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-serif font-light tracking-tight text-[var(--dashboard-text)]">Today's Meetings</CardTitle>
                        <p className="text-xs text-[var(--dashboard-text-muted)] font-light">Your upcoming schedule</p>
                    </div>
                </div>
                <Link href="/admin/appointments">
                    <Button variant="ghost" size="sm" className="text-[var(--dashboard-accent-blue)] hover:text-[var(--dashboard-accent-blue)] hover:bg-[var(--dashboard-accent-blue)]/10 rounded-full font-medium">
                        See All
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2].map(i => (
                                <div key={i} className="h-20 bg-[var(--dashboard-card-hover)] animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-[var(--dashboard-card-hover)] rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarIcon className="h-6 w-6 text-[var(--dashboard-text-muted)] opacity-30" />
                            </div>
                            <p className="text-sm text-[var(--dashboard-text-muted)] font-light">No meetings scheduled for today.</p>
                        </div>
                    ) : (
                        meetings.map((meeting) => (
                            <div key={meeting.id} className="group relative flex items-start gap-4 p-4 rounded-2xl hover:bg-[var(--dashboard-card-hover)] transition-all duration-300 border border-transparent hover:border-[var(--dashboard-border)]">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl glass-card flex flex-col items-center justify-center border-[var(--dashboard-border)]">
                                    <span className="text-[10px] uppercase font-bold text-[var(--dashboard-accent-blue)] tracking-tighter">
                                        {new Date(meeting.appointment_date).toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                    <span className="text-lg font-serif font-bold leading-none text-[var(--dashboard-text)]">
                                        {new Date(meeting.appointment_date).getDate()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-[var(--dashboard-text)] truncate mb-1 group-hover:text-[var(--dashboard-accent-blue)] transition-colors">
                                        {meeting.title || `Meeting with ${meeting.client_name}`}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--dashboard-text-muted)] font-light opacity-70">
                                            <Clock className="h-3 w-3" />
                                            {meeting.appointment_time}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--dashboard-text-muted)] font-light opacity-70">
                                            <User className="h-3 w-3" />
                                            {meeting.client_name}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                        <ArrowRight className="h-4 w-4 text-[var(--dashboard-accent-blue)]" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Link href="/admin/appointments">
                    <Button variant="outline" className="w-full mt-8 rounded-xl border-dashed border-[var(--dashboard-border)] hover:border-[var(--dashboard-accent-blue)]/50 hover:bg-[var(--dashboard-accent-blue)]/5 text-[var(--dashboard-accent-blue)] transition-all duration-300">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

import { ArrowRight } from 'lucide-react'
