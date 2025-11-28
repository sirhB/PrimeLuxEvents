'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const tasks = [
    {
        id: 1,
        title: "Send final payment reminder",
        project: "Emma & Liam's Wedding",
        completed: false
    },
    {
        id: 2,
        title: "Confirm seating plan updates",
        project: "Emma & Liam's Wedding",
        completed: false
    },
    {
        id: 3,
        title: "Review guest list updates",
        project: "Hope for All Charity Gala",
        completed: false
    }
]

export function TasksCard() {
    return (
        <Card className="border-none shadow-sm rounded-3xl bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold">Today's Tasks</CardTitle>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">12</span>
                </div>
                <Button variant="link" className="text-[#6366f1] font-semibold">See All</Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-1 h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-[#6366f1] transition-colors" />
                            <div>
                                <p className="font-medium text-gray-900 leading-none mb-1.5">{task.title}</p>
                                <p className="text-sm text-[#6366f1] font-medium">{task.project}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Button variant="ghost" className="mt-6 text-[#6366f1] hover:text-[#5558dd] hover:bg-indigo-50 pl-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                </Button>
            </CardContent>
        </Card>
    )
}
