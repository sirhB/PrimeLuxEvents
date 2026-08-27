import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, addMonths, subMonths, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Briefcase, MapPin } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdminPage } from '@/components/admin/page-shell'
import { AdminPageHeader } from '@/components/admin/page-shell'

export default async function CalendarPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>
}) {
    const { month } = await searchParams
    const supabase = await createClient()

    // 1. Determine current view month
    const today = new Date()
    const currentMonth = month ? parseISO(month) : startOfMonth(today)
    const nextMonth = addMonths(currentMonth, 1)
    const prevMonth = subMonths(currentMonth, 1)

    // 2. Fetch Data for the entire month window (including padding days)
    const viewStart = startOfWeek(startOfMonth(currentMonth))
    const viewEnd = endOfWeek(endOfMonth(currentMonth))

    // Fetch Tasks
    const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, status, priority, task_type')
        .gte('due_date', viewStart.toISOString())
        .lte('due_date', viewEnd.toISOString())

    // Fetch Appointments
    const { data: appointments } = await supabase
        .from('appointments')
        .select('id, client_name, appointment_date, appointment_time, status, location')
        .gte('appointment_date', viewStart.toISOString())
        .lte('appointment_date', viewEnd.toISOString())

    // 3. Grid Generation
    const days = eachDayOfInterval({ start: viewStart, end: viewEnd })

    return (
        <AdminPage>
            <AdminPageHeader
                eyebrow="Logistics"
                title="Master Calendar"
                description="Unified view of all tasks, deliveries, and appointments."
                actions={
                    <div className="flex items-center gap-2 rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-1">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/calendar?month=${format(prevMonth, 'yyyy-MM-dd')}`}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <span className="min-w-[140px] text-center text-sm font-semibold">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/calendar?month=${format(nextMonth, 'yyyy-MM-dd')}`}>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* Calendar Grid */}
            <div className="glass-card border-none overflow-hidden rounded-[2rem] shadow-2xl">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-[var(--dashboard-border)] bg-black/10">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 auto-rows-fr bg-black/20">
                    {days.map((day, dayIdx) => {
                        // Filter events for this day
                        const dayTasks = tasks?.filter(t => isSameDay(parseISO(t.due_date), day)) || []
                        const dayAppointments = appointments?.filter(a => isSameDay(parseISO(a.appointment_date), day)) || []

                        const isCurrentMonth = isSameMonth(day, currentMonth)
                        const isTodayDate = isToday(day)

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "min-h-[140px] p-3 border-r border-b border-[var(--dashboard-border)] transition-colors hover:bg-white/5 flex flex-col gap-2 group",
                                    !isCurrentMonth && "bg-black/40 opacity-50",
                                    isTodayDate && "bg-[var(--dashboard-accent-gold)]/5 shadow-inner"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={cn(
                                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                        isTodayDate
                                            ? "bg-[var(--dashboard-accent-gold)] text-black font-bold"
                                            : "text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-text)]"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {isTodayDate && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)] pr-2">Today</span>
                                    )}
                                </div>

                                {/* Events List */}
                                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[120px] custom-scrollbar">
                                    {/* Appointments */}
                                    {dayAppointments.map(apt => (
                                        <div key={apt.id} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-500/20 cursor-default transition-colors">
                                            <Clock className="w-3 h-3 shrink-0 opacity-70" />
                                            <span className="truncate">{apt.appointment_time?.slice(0, 5)} • {apt.client_name}</span>
                                        </div>
                                    ))}

                                    {/* Tasks */}
                                    {dayTasks.map(task => (
                                        <div key={task.id} className={cn(
                                            "text-xs px-2 py-1.5 rounded-lg flex items-center gap-2 border hover:opacity-100 transition-all cursor-default",
                                            task.status === 'completed'
                                                ? "bg-green-500/10 border-green-500/20 text-green-300 opacity-60 line-through"
                                                : "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                                                task.priority === 'urgent' ? 'bg-red-400' :
                                                    task.priority === 'high' ? 'bg-orange-400' :
                                                        'bg-[var(--dashboard-accent-gold)]'
                                            )} />
                                            <span className="truncate">{task.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 justify-center text-xs text-[var(--dashboard-text-muted)]">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/40" />
                    <span>Appointments</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--dashboard-card)] border border-[var(--dashboard-border)]" />
                    <span>Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Urgent Task</span>
                </div>
            </div>
        </AdminPage>
    )
}
