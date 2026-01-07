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
        case 'urgent': return 'text-red-400 bg-red-400/10 border-red-400/20'
        case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
        case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
        default: return 'text-[var(--dashboard-text-muted)] bg-[var(--dashboard-card)] border-[var(--dashboard-border)]'
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
            <div className="p-4 hover:bg-[var(--dashboard-card-hover)] transition-all flex flex-col md:flex-row md:items-center justify-between group gap-4 border-b border-[var(--dashboard-border)] last:border-0">
                <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                        "mt-1 p-2.5 rounded-xl shadow-sm border transition-colors",
                        task.status === 'completed'
                            ? "bg-[var(--dashboard-accent-green)]/10 text-[var(--dashboard-accent-green)] border-[var(--dashboard-accent-green)]/20"
                            : "bg-[var(--dashboard-card)] text-[var(--dashboard-accent-gold)] border-[var(--dashboard-border)]"
                    )}>
                        {getTaskIcon(task.task_type)}
                    </div>
                    <div className="space-y-1">
                        <h3 className={cn(
                            "font-medium text-lg tracking-tight transition-all",
                            task.status === 'completed'
                                ? "line-through text-[var(--dashboard-text-muted)] italic"
                                : "text-[var(--dashboard-text)]"
                        )}>
                            {task.title}
                        </h3>
                        <p className="text-sm text-[var(--dashboard-text-muted)] line-clamp-1 font-light">{task.description}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px]">
                            <span className={cn(
                                "px-2 py-0.5 rounded-full border shadow-sm font-bold uppercase tracking-widest",
                                getPriorityColor(task.priority)
                            )}>
                                {task.priority}
                            </span>

                            <div className="flex items-center gap-1.5 text-[var(--dashboard-text-muted)] bg-[var(--dashboard-card)] px-2 py-0.5 rounded-full border border-[var(--dashboard-border)]">
                                {task.assigned_role_id ? (
                                    <Shield className="h-3 w-3 text-[var(--dashboard-accent-gold)]" />
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--dashboard-accent-gold)]" />
                                )}
                                <span className="font-medium">{task.assigned_to_text || 'Unassigned'}</span>
                            </div>

                            {task.due_date && (
                                <div className="flex items-center gap-1.5 text-[var(--dashboard-text-muted)] bg-[var(--dashboard-card)] px-2 py-0.5 rounded-full border border-[var(--dashboard-border)]">
                                    <Clock className="h-3 w-3 opacity-60" />
                                    <span>Due {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                            )}

                            {task.task_type && (
                                <div className="flex items-center gap-1.5 text-[var(--dashboard-text-muted)] bg-[var(--dashboard-card)] px-2 py-0.5 rounded-full border border-[var(--dashboard-border)] capitalize">
                                    <span className="opacity-60">{task.task_type.replace('_', ' ')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                    <StatusBadge status={task.status} />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-card-hover)] rounded-xl transition-all">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)} className="hover:bg-[var(--dashboard-accent-gold)]/10 focus:bg-[var(--dashboard-accent-gold)]/10 rounded-lg">
                                <Pencil className="h-4 w-4 mr-2 text-[var(--dashboard-accent-gold)]" />
                                Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-400 focus:text-red-400 focus:bg-red-400/10 hover:bg-red-400/10 rounded-lg"
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
                <DialogContent className="max-w-2xl bg-[var(--dashboard-background)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] p-0 overflow-hidden rounded-2xl">
                    <div className="p-6 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif font-light text-[var(--dashboard-text)]">Edit Task</DialogTitle>
                            <DialogDescription className="text-[var(--dashboard-text-muted)]">
                                Refine the details for this operational task.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        <TaskForm
                            task={task}
                            onSuccess={() => {
                                setIsEditDialogOpen(false)
                                router.refresh()
                            }}
                            onCancel={() => setIsEditDialogOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
