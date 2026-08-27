import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, addMonths, subMonths, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Briefcase, MapPin, Package } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WAREHOUSE_CATEGORY_LABELS, type WarehouseCategory } from '@/lib/warehouse/types'

const warehouseCategoryColors: Record<WarehouseCategory, string> = {
    pick: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    pack: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    vehicle_load: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    put_away: 'bg-teal-500/10 border-teal-500/20 text-teal-300',
    inventory_maintenance: 'bg-orange-500/10 border-orange-500/20 text-orange-300',
    returns_checkin: 'bg-pink-500/10 border-pink-500/20 text-pink-300',
    location_audit: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300',
    general: 'bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]',
}

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
        .select('id, title, due_date, status, priority, task_type, warehouse_category')
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
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Logistics
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Master Calendar
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Unified view of all tasks, deliveries, and appointments.
                    </p>
                </div>

                <div className="flex items-center gap-4 glass-card p-2 rounded-2xl border-none bg-black/20">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/calendar?month=${format(prevMonth, 'yyyy-MM-dd')}`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <span className="text-lg font-serif min-w-[140px] text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/calendar?month=${format(nextMonth, 'yyyy-MM-dd')}`}>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

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
                            <Link
                                key={day.toString()}
                                href={`/admin/warehouse/schedule?date=${format(day, 'yyyy-MM-dd')}`}
                                className={cn(
                                    "min-h-[140px] p-3 border-r border-b border-[var(--dashboard-border)] transition-colors hover:bg-white/5 flex flex-col gap-2 group block",
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
                                    {dayTasks.map(task => {
                                        const isWarehouse = task.task_type === 'warehouse' || task.warehouse_category
                                        const category = (task.warehouse_category || 'general') as WarehouseCategory
                                        const colorClass = isWarehouse
                                            ? warehouseCategoryColors[category]
                                            : task.status === 'completed'
                                              ? "bg-green-500/10 border-green-500/20 text-green-300 opacity-60 line-through"
                                              : "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]"

                                        return (
                                            <div key={task.id} className={cn(
                                                "text-xs px-2 py-1.5 rounded-lg flex items-center gap-2 border hover:opacity-100 transition-all",
                                                colorClass
                                            )}>
                                                {isWarehouse ? (
                                                    <Package className="w-3 h-3 shrink-0 opacity-70" />
                                                ) : (
                                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                                                        task.priority === 'urgent' ? 'bg-red-400' :
                                                            task.priority === 'high' ? 'bg-orange-400' :
                                                                'bg-[var(--dashboard-accent-gold)]'
                                                    )} />
                                                )}
                                                <span className="truncate">
                                                    {isWarehouse && task.warehouse_category
                                                        ? `${WAREHOUSE_CATEGORY_LABELS[category]}: `
                                                        : ''}
                                                    {task.title}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </Link>
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
                    <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/40" />
                    <span>Warehouse Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[var(--dashboard-card)] border border-[var(--dashboard-border)]" />
                    <span>Other Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Urgent Task</span>
                </div>
            </div>
        </div>
    )
}
