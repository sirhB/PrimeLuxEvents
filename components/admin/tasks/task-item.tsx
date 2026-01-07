'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Calendar,
    CheckCircle2,
    Clock,
    Flag,
    Truck,
    Briefcase,
    Home,
    Building,
    MapPin,
    Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/ui/status-badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TaskForm } from './task-form'
import { cn } from '@/lib/utils'

interface TaskItemProps {
    task: any
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
        case 'urgent': return 'text-red-600 bg-red-50 border-red-200'
        case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        default: return 'text-muted-foreground bg-muted/30 border-border'
    }
}

export function TaskItem({ task }: TaskItemProps) {
    const router = useRouter()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const supabase = createClient()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return

        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', task.id)

            if (error) throw error

            toast.success('Task deleted successfully')
            router.refresh()
        } catch (error) {
            console.error('Error deleting task:', error)
            toast.error('Failed to delete task')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <div className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        "mt-1 p-2 rounded-full",
                        task.status === 'completed' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                    )}>
                        {getTaskIcon(task.task_type)}
                    </div>
                    <div>
                        <h3 className={cn(
                            "font-medium text-foreground",
                            task.status === 'completed' && "line-through text-muted-foreground"
                        )}>
                            {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className={cn("px-2 py-0.5 rounded-full border shadow-sm font-medium", getPriorityColor(task.priority))}>
                                {task.priority}
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                {task.assigned_role_id && <Shield className="h-3 w-3 text-muted-foreground" />}
                                {task.assigned_to_text || 'Unassigned'}
                            </span>
                            {task.due_date && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Update the task details below.
                        </DialogDescription>
                    </DialogHeader>
                    <TaskForm
                        task={task}
                        onSuccess={() => {
                            setIsEditDialogOpen(false)
                        }}
                        onCancel={() => setIsEditDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}
