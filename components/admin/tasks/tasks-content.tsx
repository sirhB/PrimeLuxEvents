'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTaskDialog } from '@/components/admin/tasks/create-task-dialog'
import { CheckCircle2, Clock, Briefcase, Truck, Home, Building, MapPin, Calendar, Search } from 'lucide-react'
import { TaskItem } from '@/components/admin/tasks/task-item'
import { cn } from '@/lib/utils'
import { AdminPageHeader } from '@/components/admin/page-shell'

interface TasksContentProps {
    tasks: any[] | null
    user: any
    roleIds: string[]
}

function getTaskIcon(type: string) {
    switch (type) {
        case 'delivery': return <Truck className="h-4 w-4" />
        case 'event': return <Calendar className="h-4 w-4" />
        case 'warehouse': return <Home className="h-4 w-4" />
        case 'office': return <Building className="h-4 w-4" />
        case 'venue': return <MapPin className="h-4 w-4" />
        case 'return_trip': return <Truck className="h-4 w-4 rotate-180" />
        default: return <Briefcase className="h-4 w-4" />
    }
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'urgent': return 'text-red-400 bg-red-400/10 border-red-400/20'
        case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
        case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
        default: return 'text-[var(--dashboard-text-muted)] bg-[var(--dashboard-card)] border-[var(--dashboard-border)]'
    }
}

function TaskBoardItem({ task }: { task: any }) {
    return (
        <Card className="border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-[var(--dashboard-shadow)] hover:border-[var(--dashboard-accent-gold)]/40 transition-[color,background-color,border-color,box-shadow,opacity,transform] cursor-pointer group">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <span className={cn(
                        "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm font-medium",
                        getPriorityColor(task.priority)
                    )}>
                        {task.priority}
                    </span>
                    <div className="p-1.5 rounded-md bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-accent-gold)] transition-colors">
                        {getTaskIcon(task.task_type)}
                    </div>
                </div>
                <h4 className="font-medium text-[var(--dashboard-text)] mb-1 line-clamp-2">{task.title}</h4>
                <p className="text-xs text-[var(--dashboard-text-muted)] line-clamp-2 mb-4">{task.description}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--dashboard-border)]">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--dashboard-accent-gold)]/10 flex items-center justify-center border border-[var(--dashboard-accent-gold)]/20 text-[var(--dashboard-accent-gold)]">
                            <span className="text-[10px] font-bold">{(task.assigned_to_text || 'U')[0].toUpperCase()}</span>
                        </div>
                        <span className="text-[10px] text-[var(--dashboard-text-muted)]">{task.assigned_to_text || 'Unassigned'}</span>
                    </div>
                    {task.due_date && (
                        <div className={cn("flex items-center gap-1 text-[10px]",
                            (new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== 'completed' && task.status !== 'cancelled')
                                ? "text-red-400 font-medium"
                                : "text-[var(--dashboard-text-muted)]"
                        )}>
                            <Clock className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export function TasksContent({ tasks, user, roleIds }: TasksContentProps) {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const [query, setQuery] = useState('')
    const filteredTasks = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return tasks || []
        return (tasks || []).filter((task) =>
            [task.title, task.description, task.assigned_to_text, task.priority, task.status, task.task_type]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(q),
        )
    }, [tasks, query])

    const pendingTasks = filteredTasks.filter(t => t.status === 'pending')
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress')
    const completedTasks = filteredTasks.filter(t => t.status === 'completed')

    const myTasks = filteredTasks.filter(t =>
        (user?.id && t.assigned_to === user.id) ||
        (t.assigned_role_id && roleIds.includes(t.assigned_role_id))
    ) || []

    const overdueTasks = (tasks || []).filter(t => {
        if (!t.due_date) return false
        const dueDate = new Date(t.due_date)
        return dueDate < now && t.status !== 'completed' && t.status !== 'cancelled'
    }) || []

    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                eyebrow="Operations"
                title="Task Management"
                description="Coordinate event execution and manage team responsibilities."
                actions={<CreateTaskDialog />}
            />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                    { label: 'Overdue', value: overdueTasks.length, tint: 'bg-[var(--lux-blush)]', hint: 'Action required' },
                    { label: 'Pending', value: pendingTasks.length, tint: 'bg-[var(--lux-cream)]', hint: 'Awaiting start' },
                    { label: 'In progress', value: inProgressTasks.length, tint: 'bg-[var(--lux-mist)]', hint: 'Currently active' },
                    { label: 'Completed', value: completedTasks.length, tint: 'bg-[var(--lux-sage-mist)]', hint: 'Finished' },
                ].map((stat) => (
                    <div key={stat.label} className={cn('rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] p-4', stat.tint)}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)]">{stat.label}</p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--dashboard-text)]">{stat.value}</p>
                        <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">{stat.hint}</p>
                    </div>
                ))}
            </div>

            <label className="relative block max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--dashboard-text-muted)]" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search tasks"
                    className="h-11 w-full rounded-full border border-[var(--dashboard-border)] bg-white pl-10 pr-4 text-sm text-[var(--dashboard-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--lux-gold)]"
                />
            </label>

            <Tabs defaultValue="all" className="w-full animate-fade-in-up delay-200">
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="h-auto w-fit rounded-full border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-1">
                        <TabsTrigger
                            value="all"
                            className="rounded-full px-5 data-[state=active]:bg-[var(--lux-navy)] data-[state=active]:text-[var(--theme-on-dark)]"
                        >
                            All Tasks
                        </TabsTrigger>
                        <TabsTrigger
                            value="board"
                            className="rounded-full px-5 data-[state=active]:bg-[var(--lux-navy)] data-[state=active]:text-[var(--theme-on-dark)]"
                        >
                            Board View
                        </TabsTrigger>
                        <TabsTrigger
                            value="my-tasks"
                            className="rounded-full px-5 data-[state=active]:bg-[var(--lux-navy)] data-[state=active]:text-[var(--theme-on-dark)]"
                        >
                            My Tasks
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="mt-0">
                    <Card className="glass-card border-none overflow-hidden">
                        <CardContent className="p-0">
                            <div className="divide-y divide-[var(--dashboard-border)]">
                                {filteredTasks.map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="board" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-4 py-3 mb-2 rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--dashboard-text)]">
                                    <span className="w-2 h-2 rounded-full bg-[var(--dashboard-accent-orange)]" />
                                    Pending
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)]">
                                    {pendingTasks.length} Units
                                </span>
                            </div>
                            <div className="flex flex-col gap-4">
                                {pendingTasks.map(task => (
                                    <TaskBoardItem key={task.id} task={task} />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-4 py-3 mb-2 rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--dashboard-text)]">
                                    <span className="w-2 h-2 rounded-full bg-[var(--dashboard-accent-blue)]" />
                                    In Progress
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)]">
                                    {inProgressTasks.length} Units
                                </span>
                            </div>
                            <div className="flex flex-col gap-4">
                                {inProgressTasks.map(task => (
                                    <TaskBoardItem key={task.id} task={task} />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-4 py-3 mb-2 rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--dashboard-text)]">
                                    <span className="w-2 h-2 rounded-full bg-[var(--dashboard-accent-green)]" />
                                    Completed
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent-gold)]">
                                    {completedTasks.length} Units
                                </span>
                            </div>
                            <div className="flex flex-col gap-4">
                                {completedTasks.map(task => (
                                    <TaskBoardItem key={task.id} task={task} />
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="my-tasks" className="mt-0">
                    <Card className="glass-card border-none overflow-hidden">
                        <CardHeader className="border-b border-[var(--dashboard-border)] bg-[var(--lux-cream)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-semibold">My Assignments</CardTitle>
                                    <p className="text-xs text-[var(--dashboard-text-muted)]">Tasks assigned to you or your team</p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] text-xs font-bold uppercase tracking-wider border border-[var(--dashboard-accent-gold)]/20">
                                    {myTasks.length} Active
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-[var(--dashboard-border)]">
                                {myTasks.length > 0 ? (
                                    myTasks.map((task) => (
                                        <TaskItem key={task.id} task={task} />
                                    ))
                                ) : (
                                    <div className="p-16 text-center text-[var(--dashboard-text-muted)] flex flex-col items-center justify-center gap-4">
                                        <div className="p-6 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] shadow-inner">
                                            <CheckCircle2 className="h-10 w-10 text-[var(--dashboard-accent-green)] opacity-40" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold text-[var(--dashboard-text)]">All Caught Up</h3>
                                            <p className="text-sm opacity-60 max-w-xs mx-auto">You have no pending tasks assigned to you at the moment.</p>
                                        </div>
                                        <div className="mt-4">
                                            <CreateTaskDialog />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
