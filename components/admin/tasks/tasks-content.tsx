'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTaskDialog } from '@/components/admin/tasks/create-task-dialog'
import { CheckCircle2, Clock, Flag, Briefcase, Truck, Home, Building, MapPin, Calendar, AlertCircle } from 'lucide-react'
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
        <Card className="glass-card border-[var(--dashboard-border)] hover:border-[var(--dashboard-accent-gold)]/30 transition-all cursor-pointer group">
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

    const pendingTasks = tasks?.filter(t => t.status === 'pending') || []
    const inProgressTasks = tasks?.filter(t => t.status === 'in_progress') || []
    const completedTasks = tasks?.filter(t => t.status === 'completed') || []

    const myTasks = tasks?.filter(t =>
        (user?.id && t.assigned_to === user.id) ||
        (t.assigned_role_id && roleIds.includes(t.assigned_role_id))
    ) || []

    const overdueTasks = tasks?.filter(t => {
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

            <div className="grid gap-6 md:grid-cols-4 animate-fade-in-up delay-100">
                <Card className="glass-card border-none overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Overdue</CardTitle>
                        <div className="p-2 rounded-lg bg-red-400/10 text-red-400">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-light text-[var(--dashboard-text)]">{overdueTasks.length}</div>
                        <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">Action required</p>
                    </CardContent>
                </Card>

                <Card className="glass-card border-none overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--dashboard-accent-orange)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Pending</CardTitle>
                        <div className="p-2 rounded-lg bg-[var(--dashboard-accent-orange)]/10 text-[var(--dashboard-accent-orange)]">
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-light text-[var(--dashboard-text)]">{pendingTasks.length}</div>
                        <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">Awaiting start</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--dashboard-accent-blue)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">In Progress</CardTitle>
                        <div className="p-2 rounded-lg bg-[var(--dashboard-accent-blue)]/10 text-[var(--dashboard-accent-blue)]">
                            <Flag className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-light text-[var(--dashboard-text)]">{inProgressTasks.length}</div>
                        <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">Currently active</p>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--dashboard-accent-green)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Completed</CardTitle>
                        <div className="p-2 rounded-lg bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)]">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-light text-[var(--dashboard-text)]">{completedTasks.length}</div>
                        <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">Successfully finished</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full animate-fade-in-up delay-200">
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="glass-card border-none p-1 bg-black/20 w-fit h-auto">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6"
                        >
                            All Tasks
                        </TabsTrigger>
                        <TabsTrigger
                            value="board"
                            className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6"
                        >
                            Board View
                        </TabsTrigger>
                        <TabsTrigger
                            value="my-tasks"
                            className="data-[state=active]:bg-[var(--dashboard-accent-gold)] data-[state=active]:text-black px-6"
                        >
                            My Tasks
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="mt-0">
                    <Card className="glass-card border-none overflow-hidden">
                        <CardContent className="p-0">
                            <div className="divide-y divide-[var(--dashboard-border)]">
                                {tasks?.map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="board" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-4 py-3 glass-card border-none rounded-2xl mb-2">
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
                            <div className="flex items-center justify-between px-4 py-3 glass-card border-none rounded-2xl mb-2">
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
                            <div className="flex items-center justify-between px-4 py-3 glass-card border-none rounded-2xl mb-2">
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
                        <CardHeader className="border-b border-[var(--dashboard-border)] bg-black/10">
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
