'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Wand2,
    RefreshCw,
    LayoutGrid,
    List,
    Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { WarehouseTaskCard } from './warehouse-task-card'
import { WarehouseTaskDetail } from './warehouse-task-detail'
import { CreateWarehouseTaskDialog } from './create-warehouse-task-dialog'
import {
    generateRecurringTasks,
    generateTasksForDeliveryDate,
} from '@/app/admin/warehouse/actions'
import { AdminPageHeader } from '@/components/admin/page-shell'
import {
    WAREHOUSE_CATEGORY_ORDER,
    WAREHOUSE_CATEGORY_LABELS,
    type WarehouseTask,
    type WarehouseCategory,
} from '@/lib/warehouse/types'

interface WarehouseScheduleContentProps {
    initialTasks: WarehouseTask[]
    selectedDate: string
    userId?: string
    roleIds: string[]
    staffOnShift?: string[]
}

export function WarehouseScheduleContent({
    initialTasks,
    selectedDate,
    userId,
    roleIds,
    staffOnShift = [],
}: WarehouseScheduleContentProps) {
    const router = useRouter()
    const [tasks, setTasks] = useState<WarehouseTask[]>(initialTasks)
    const [selectedTask, setSelectedTask] = useState<WarehouseTask | null>(null)
    const [viewMode, setViewMode] = useState<'board' | 'queue'>('board')
    const [filter, setFilter] = useState<'all' | 'mine' | 'shift'>('all')
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        setTasks(initialTasks)
        setSelectedTask(null)
    }, [initialTasks])

    useEffect(() => {
        if (filter === 'shift' && staffOnShift.length === 0) {
            setFilter('all')
        }
    }, [filter, staffOnShift.length])

    const refresh = useCallback(() => {
        router.refresh()
    }, [router])

    function handleDateChange(date: string) {
        router.push(`/admin/warehouse/schedule?date=${encodeURIComponent(date)}`)
    }

    const filteredTasks = tasks.filter((t) => {
        if (filter === 'mine') {
            return (
                (userId && t.assigned_to === userId) ||
                (t.assigned_role_id && roleIds.includes(t.assigned_role_id))
            )
        }
        if (filter === 'shift' && staffOnShift.length > 0) {
            return t.assigned_to && staffOnShift.includes(t.assigned_to)
        }
        return true
    })

    const pending = filteredTasks.filter((t) => t.status === 'pending')
    const inProgress = filteredTasks.filter((t) => t.status === 'in_progress')
    const completed = filteredTasks.filter((t) => t.status === 'completed')
    const today = new Date().toISOString().split('T')[0]
    const overdue = filteredTasks.filter(
        (t) =>
            t.due_date &&
            t.due_date < today &&
            t.status !== 'completed' &&
            t.status !== 'cancelled'
    )

    async function handleGenerateForDate() {
        setGenerating(true)
        const result = await generateTasksForDeliveryDate(selectedDate)
        setGenerating(false)
        if (result.generated > 0) {
            toast.success(`Generated tasks for ${result.generated} order(s)`)
            refresh()
        } else if (result.errors.length > 0) {
            toast.error(result.errors[0])
        } else {
            toast.info('No orders found for this delivery date')
        }
    }

    async function handleGenerateRecurring() {
        setGenerating(true)
        const result = await generateRecurringTasks(selectedDate)
        setGenerating(false)
        if (result.success && result.created > 0) {
            toast.success(`Created ${result.created} recurring task(s)`)
            refresh()
        } else if (result.created === 0) {
            toast.info('No recurring tasks due today')
        } else {
            toast.error(result.error || 'Failed to generate recurring tasks')
        }
    }

    const tasksByCategory = WAREHOUSE_CATEGORY_ORDER.reduce(
        (acc, cat) => {
            acc[cat] = filteredTasks.filter(
                (t) => (t.warehouse_category || 'general') === cat && t.status !== 'cancelled'
            )
            return acc
        },
        {} as Record<WarehouseCategory, WarehouseTask[]>
    )

    const queueTasks = [...filteredTasks]
        .filter((t) => t.status !== 'cancelled' && t.status !== 'completed')
        .sort((a, b) => {
            const timeA = typeof a.scheduled_start === 'string' ? a.scheduled_start : '99:99'
            const timeB = typeof b.scheduled_start === 'string' ? b.scheduled_start : '99:99'
            if (timeA !== timeB) return timeA.localeCompare(timeB)
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
            return (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
                (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
        })

    return (
        <div className="flex flex-col gap-8">
            <AdminPageHeader
                eyebrow="Operations"
                title="Warehouse Schedule"
                description="Daily task queue for picking, packing, loading, and inventory maintenance."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <CreateWarehouseTaskDialog defaultDate={selectedDate} onSuccess={refresh} />
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            disabled={generating}
                            onClick={handleGenerateForDate}
                        >
                            {generating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Wand2 className="h-4 w-4 mr-2" />
                            )}
                            Generate from Orders
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            disabled={generating}
                            onClick={handleGenerateRecurring}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Recurring
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card border-none rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Clock className="h-8 w-8 text-[var(--dashboard-text-muted)]" />
                        <div>
                            <p className="text-2xl font-bold">{pending.length}</p>
                            <p className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Loader2 className="h-8 w-8 text-blue-400" />
                        <div>
                            <p className="text-2xl font-bold">{inProgress.length}</p>
                            <p className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider">In Progress</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-8 w-8 text-[var(--dashboard-accent-green)]" />
                        <div>
                            <p className="text-2xl font-bold">{completed.length}</p>
                            <p className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider">Completed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none rounded-2xl">
                    <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                        <div>
                            <p className="text-2xl font-bold">{overdue.length}</p>
                            <p className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider">Overdue</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-72 space-y-4 shrink-0">
                    <Card className="glass-card border-none rounded-2xl">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                Date
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full bg-black/10 border border-[var(--dashboard-border)] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[var(--dashboard-accent-gold)] outline-none text-[var(--dashboard-text)]"
                            />
                            <p className="text-xs text-[var(--dashboard-text-muted)] mt-2">
                                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                            </p>
                        </CardContent>
                    </Card>

                    <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                        <TabsList
                            className={cn(
                                'w-full grid bg-black/20',
                                staffOnShift.length > 0 ? 'grid-cols-3' : 'grid-cols-2'
                            )}
                        >
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="mine" className="text-xs">My Tasks</TabsTrigger>
                            {staffOnShift.length > 0 && (
                                <TabsTrigger value="shift" className="text-xs">On Shift</TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>

                    <div className="flex bg-black/20 p-1 rounded-xl">
                        <Button
                            variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="flex-1 rounded-lg"
                            onClick={() => setViewMode('board')}
                        >
                            <LayoutGrid className="h-4 w-4 mr-1" />
                            Board
                        </Button>
                        <Button
                            variant={viewMode === 'queue' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="flex-1 rounded-lg"
                            onClick={() => setViewMode('queue')}
                        >
                            <List className="h-4 w-4 mr-1" />
                            Queue
                        </Button>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {viewMode === 'board' ? (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {WAREHOUSE_CATEGORY_ORDER.map((category) => {
                                const catTasks = tasksByCategory[category]
                                if (catTasks.length === 0) return null
                                return (
                                    <div key={category} className="space-y-3">
                                        <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--dashboard-text-muted)] flex items-center gap-2">
                                            {WAREHOUSE_CATEGORY_LABELS[category]}
                                            <span className="text-[var(--dashboard-accent-gold)]">({catTasks.length})</span>
                                        </h3>
                                        <div className="space-y-2">
                                            {catTasks.map((task) => (
                                                <WarehouseTaskCard
                                                    key={task.id}
                                                    task={task}
                                                    selected={selectedTask?.id === task.id}
                                                    onClick={() => setSelectedTask(task)}
                                                    compact
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                            {filteredTasks.length === 0 && (
                                <div className="col-span-full text-center py-16 text-[var(--dashboard-text-muted)]">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                    <p>No warehouse tasks for this date.</p>
                                    <p className="text-sm mt-2">Create a task or generate from orders.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--dashboard-text-muted)]">
                                Today&apos;s Queue
                            </h3>
                            {queueTasks.length === 0 ? (
                                <div className="text-center py-16 text-[var(--dashboard-text-muted)] glass-card rounded-2xl">
                                    All caught up — no open tasks.
                                </div>
                            ) : (
                                queueTasks.map((task) => (
                                    <WarehouseTaskCard
                                        key={task.id}
                                        task={task}
                                        selected={selectedTask?.id === task.id}
                                        onClick={() => setSelectedTask(task)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {selectedTask && (
                    <div className="lg:w-96 shrink-0">
                        <Card className="glass-card border-none rounded-2xl sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                            <CardContent className="p-6">
                                <WarehouseTaskDetail task={selectedTask} onUpdate={refresh} />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
