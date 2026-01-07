'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Calendar, User, Flag, Truck, Briefcase, Home, Building, MapPin, Check, ChevronsUpDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface TaskFormData {
    title: string
    description: string
    status: string
    priority: string
    assigned_to: string
    due_date: string
    task_type: string
    event_id?: string
}

interface TaskFormProps {
    eventId?: string
    task?: TaskFormData & { id: string }
    onSuccess?: () => void
    onCancel?: () => void
}

const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
]

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
]

const taskTypes = [
    { value: 'general', label: 'General', icon: Briefcase },
    { value: 'delivery', label: 'Delivery', icon: Truck },
    { value: 'warehouse', label: 'Warehouse', icon: Home },
    { value: 'office', label: 'Office', icon: Building },
    { value: 'venue', label: 'Venue', icon: MapPin },
    { value: 'return_trip', label: 'Return Trip', icon: Truck }
]

export function TaskForm({ eventId, task, onSuccess, onCancel }: TaskFormProps) {
    const router = useRouter()
    const [teamMembers, setTeamMembers] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<TaskFormData>({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'pending',
        priority: task?.priority || 'medium',
        assigned_to: task?.assigned_to || '',
        due_date: task?.due_date || '',
        task_type: task?.task_type || 'general',
        event_id: task?.event_id || eventId || ''
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const supabase = createClient()

    useEffect(() => {
        const fetchTeam = async () => {
            const { data } = await supabase
                .from('user_profiles')
                .select('id, full_name, email')
                .eq('is_active', true)
            if (data) setTeamMembers(data)
        }
        fetchTeam()
    }, [supabase])

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.title.trim()) newErrors.title = 'Task title is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            const selectedMember = teamMembers.find(m => m.id === formData.assigned_to)
            const taskData = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                task_type: formData.task_type,
                due_date: formData.due_date || null,
                assigned_to: formData.assigned_to === 'unassigned' ? null : (formData.assigned_to || null),
                assigned_to_text: selectedMember ? (selectedMember.full_name || selectedMember.email) : (formData.assigned_to === 'unassigned' ? null : (formData.assigned_to || null)),
                event_id: formData.event_id || null,
                updated_at: new Date().toISOString()
            }

            if (task?.id) {
                const { error } = await supabase
                    .from('tasks')
                    .update(taskData)
                    .eq('id', task.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('tasks')
                    .insert([{
                        ...taskData,
                        created_by_text: 'admin'
                    }])
                if (error) throw error
            }

            router.refresh()
            onSuccess?.()
        } catch (error) {
            console.error('Error saving task:', error)
            setErrors({ submit: 'Failed to save task. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof TaskFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Deliver catering equipment"
                    required
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description of the task..."
                    rows={3}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="task_type">Task Type</Label>
                    <Select value={formData.task_type} onValueChange={(value) => handleInputChange('task_type', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {taskTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                        <type.icon className="h-4 w-4 text-muted-foreground" />
                                        {type.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                    <div className="flex items-center gap-2">
                                        <Flag className={`h-4 w-4 ${priority.value === 'urgent' ? 'text-red-500' :
                                            priority.value === 'high' ? 'text-orange-500' :
                                                priority.value === 'medium' ? 'text-yellow-500' :
                                                    'text-gray-500'
                                            }`} />
                                        {priority.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between font-normal"
                        >
                            {formData.assigned_to && formData.assigned_to !== 'unassigned'
                                ? teamMembers.find((member) => member.id === formData.assigned_to)?.full_name ||
                                teamMembers.find((member) => member.id === formData.assigned_to)?.email
                                : "Select team member..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search team members..." />
                            <CommandEmpty>No team member found.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem
                                    value="unassigned"
                                    onSelect={() => {
                                        handleInputChange('assigned_to', 'unassigned')
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            formData.assigned_to === 'unassigned' || !formData.assigned_to ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    Unassigned
                                </CommandItem>
                                {teamMembers.map((member) => (
                                    <CommandItem
                                        key={member.id}
                                        value={`${member.full_name} ${member.email}`}
                                        onSelect={() => {
                                            handleInputChange('assigned_to', member.id)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                formData.assigned_to === member.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{member.full_name || 'Unnamed'}</span>
                                            <span className="text-xs text-muted-foreground">{member.email}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errors.submit}
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    )
}
