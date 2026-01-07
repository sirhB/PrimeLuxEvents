import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTaskDialog } from '@/components/admin/tasks/create-task-dialog'
import { Calendar, CheckCircle2, Clock, Flag } from 'lucide-react'
import { TaskItem } from '@/components/admin/tasks/task-item'

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
                                    <TaskItem key={task.id} task={task} />
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
                                    <TaskItem key={task.id} task={task} />
                                ))}
                                {pendingTasks.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No pending tasks.
                                    </div>
                                )}
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
