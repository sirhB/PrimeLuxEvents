'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
        <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">Today's Tasks</CardTitle>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <Link href="/admin/tasks">
                    <Button variant="link" className="text-[#6366f1] font-semibold">See All</Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <p className="text-sm text-gray-500">No pending tasks.</p>
                    ) : (
                        tasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-3 group cursor-pointer">
                                <div className={`mt-1 h-5 w-5 rounded-full border-2 transition-colors ${task.priority === 'urgent' ? 'border-red-300 group-hover:border-red-500' :
                                        task.priority === 'high' ? 'border-orange-300 group-hover:border-orange-500' :
                                            'border-gray-300 group-hover:border-[#6366f1]'
                                    }`} />
                                <div>
                                    <p className="font-medium text-gray-900 leading-none mb-1.5">{task.title}</p>
                                    <p className="text-sm text-[#6366f1] font-medium capitalize">{task.task_type}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Link href="/admin/tasks">
                    <Button variant="ghost" className="mt-6 text-[#6366f1] hover:text-[#5558dd] hover:bg-indigo-50 pl-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
