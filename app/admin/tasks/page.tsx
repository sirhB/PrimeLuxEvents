import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTaskDialog } from '@/components/admin/tasks/create-task-dialog'
import { CheckCircle2, Clock, Flag, Briefcase, Truck, Home, Building, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { TaskItem } from '@/components/admin/tasks/task-item'
import { cn } from '@/lib/utils'

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

export default async function TasksPage() {
    const supabase = await createClient()

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

    const now = new Date()
    now.setHours(0, 0, 0, 0) // Compare vs start of today

    const pendingTasks = tasks?.filter(t => t.status === 'pending') || []
    const inProgressTasks = tasks?.filter(t => t.status === 'in_progress') || []
    const completedTasks = tasks?.filter(t => t.status === 'completed') || []

    const overdueTasks = tasks?.filter(t => {
        if (!t.due_date) return false
        // Date strings like "2023-12-25" are parsed as UTC. 
        // We want to check if the due date is strictly before "today".
        // A simple string comparison usually works for ISO dates if we format "now" correctly, 
        // but creating a Date object is safer.
        const dueDate = new Date(t.due_date)
        // Add timezone offset to treat the date as local "end of day" effectively or just ignore time?
        // Let's assume due date is "any time on that day". So it's overdue if today > due_date.
        // Actually, dueDate object from "YYYY-MM-DD" is usually UTC 00:00.
        // If we compare to local Now, we need to be careful.
        // Let's stick to the same logic: strict past.
        return dueDate < now && t.status !== 'completed' && t.status !== 'cancelled'
    }) || []

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 bg-[var(--dashboard-background)] min-h-screen admin-theme">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                            Operations
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-[var(--dashboard-text)] tracking-tight">
                        Task Management
                    </h1>
                    <p className="text-[var(--dashboard-text-muted)] font-light text-base max-w-md">
                        Coordinate event execution and manage team responsibilities.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <CreateTaskDialog />
                </div>
            </div>

            {/* Stats Overview */}
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

            {/* Tasks Tabs */}
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
                                {tasks?.length === 0 && (
                                    <div className="p-12 text-center text-[var(--dashboard-text-muted)]">
                                        <div className="mb-4 flex justify-center">
                                            <div className="p-4 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)]">
                                                <Briefcase className="h-8 w-8 opacity-20" />
                                            </div>
                                        </div>
                                        <p className="text-lg font-serif">No tasks found</p>
                                        <p className="text-sm opacity-60">Create a task to get started</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="board" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pending Column */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-4 py-3 glass-card border-none rounded-2xl mb-2">
                                <h3 className="flex items-center gap-2 font-serif text-lg text-[var(--dashboard-text)]">
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

                        {/* In Progress Column */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-4 py-3 glass-card border-none rounded-2xl mb-2">
                                <h3 className="flex items-center gap-2 font-serif text-lg text-[var(--dashboard-text)]">
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

                        {/* Completed Column */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-4 py-3 glass-card border-none rounded-2xl mb-2">
                                <h3 className="flex items-center gap-2 font-serif text-lg text-[var(--dashboard-text)]">
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
                    <div className="glass-card p-12 text-center text-[var(--dashboard-text-muted)]">
                        <div className="mb-4 flex justify-center">
                            <div className="p-4 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)]">
                                <CheckCircle2 className="h-8 w-8 opacity-20" />
                            </div>
                        </div>
                        <h3 className="text-xl font-serif text-[var(--dashboard-text)] mb-2">My Tasks View</h3>
                        <p className="max-w-sm mx-auto opacity-60">This view will display tasks specifically assigned to you or your role. Coming in the next update.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function TaskBoardItem({ task }: { task: any }) {
    // Basic overdue check for board items just for visual hint is good too
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
