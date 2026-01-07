'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2, Circle, AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Task {
    id: string
    title: string
    description: string
    status: string
    priority: string
    due_date: string
    task_type: string
}

export function TasksCard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchTasks() {
            try {
                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('status', 'pending')
                    .order('priority', { ascending: false })
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (error) throw error
                if (data) setTasks(data)
            } catch (error) {
                console.error('Error fetching tasks:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTasks()
    }, [])

    return (
        <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-3xl bg-white h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-serif font-light tracking-tight">Today's Tasks</CardTitle>
                        <p className="text-xs text-muted-foreground font-light">Your daily to-do list</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {tasks.length} Pending
                    </span>
                    <Link href="/admin/tasks">
                        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full font-medium">
                            See All
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500 font-light">All caught up! No pending tasks.</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="group relative flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100 cursor-pointer">
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    task.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                                        task.priority === 'high' ? 'bg-orange-50 text-orange-600' :
                                            'bg-blue-50 text-blue-600'
                                )}>
                                    {task.priority === 'urgent' ? <AlertCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                        {task.title}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                            {task.task_type}
                                        </span>
                                        {task.due_date && (
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                <Clock className="h-3 w-3" />
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="h-4 w-4 text-orange-600" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Link href="/admin/tasks">
                    <Button variant="outline" className="w-full mt-8 rounded-xl border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-orange-600 transition-all duration-300">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Task
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
