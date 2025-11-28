'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

const tasks = [
    { id: 1, title: 'Finalize guest list', completed: true, priority: 'high' },
    { id: 2, title: 'Confirm catering menu', completed: true, priority: 'high' },
    { id: 3, title: 'Send invitations', completed: false, priority: 'medium' },
    { id: 4, title: 'Book photographer', completed: false, priority: 'medium' },
    { id: 5, title: 'Select music playlist', completed: false, priority: 'low' },
]

export function EventTasks() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <Checkbox checked={task.completed} />
                            <div className="flex-1 space-y-1">
                                <p className={`text-sm font-medium leading-none ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                </p>
                            </div>
                            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                                {task.priority}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
