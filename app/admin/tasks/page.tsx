import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTaskDialog } from '@/components/admin/tasks/create-task-dialog'
import { Calendar, CheckCircle2, Clock, Flag, Truck, Briefcase, Home, Building, MapPin } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'

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
        case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
        case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        default: return 'text-muted-foreground bg-muted/30 border-border'
    }
}

export default async function TasksPage() {
    const supabase = await createClient()

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

    const pendingTasks = tasks?.filter(t => t.status === 'pending') || []
    const inProgressTasks = tasks?.filter(t => t.status === 'in_progress') || []
    const completedTasks = tasks?.filter(t => t.status === 'completed') || []

    return (
        <div className="flex flex-col gap-6 p-6 bg-muted/30 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage and assign tasks to your team
                    </p>
                </div>
                <CreateTaskDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingTasks.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressTasks.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedTasks.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Tasks</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {tasks?.map((task) => (
                                    <div key={task.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-2 rounded-full bg-gray-100`}>
                                                {getTaskIcon(task.task_type)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-foreground">{task.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className={`px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                    <span>{task.assigned_to_text || 'Unassigned'}</span>
                                                    {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <StatusBadge status={task.status} />
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                    </div>
                                ))}
                                {tasks?.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No tasks found.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {pendingTasks.map((task) => (
                                    <div key={task.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-2 rounded-full bg-gray-100`}>
                                                {getTaskIcon(task.task_type)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-foreground">{task.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                    <span className={`px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                    <span>{task.assigned_to_text || 'Unassigned'}</span>
                                                    {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <StatusBadge status={task.status} />
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="my-tasks" className="mt-6">
                    <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                        My Tasks view coming soon.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
