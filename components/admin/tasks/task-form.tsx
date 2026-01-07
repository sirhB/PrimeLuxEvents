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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

interface TaskFormData {
    title: string
    description: string
    status: string
    priority: string
    assigned_to: string
    assigned_role_id: string
    due_date: string
    task_type: string
    event_id?: string
}

interface TaskFormProps {
    eventId?: string
    task?: any // Using any to handle incoming data flexibly
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
    const [roles, setRoles] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<TaskFormData>({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'pending',
        priority: task?.priority || 'medium',
        assigned_to: task?.assigned_to || '',
        assigned_role_id: task?.assigned_role_id || '',
        due_date: task?.due_date || '',
        task_type: task?.task_type || 'general',
        event_id: task?.event_id || eventId || ''
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const [membersRes, rolesRes] = await Promise.all([
                supabase.from('user_profiles').select('id, full_name, email').eq('is_active', true),
                supabase.from('roles').select('id, display_name, name')
            ])

            if (membersRes.data) setTeamMembers(membersRes.data)
            if (rolesRes.data) setRoles(rolesRes.data)
        }
        fetchData()
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
            const selectedRole = roles.find(r => r.id === formData.assigned_role_id)

            const taskData = {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                task_type: formData.task_type,
                due_date: formData.due_date || null,
                assigned_to: formData.assigned_to || null,
                assigned_role_id: formData.assigned_role_id || null,
                assigned_to_text: selectedMember
                    ? (selectedMember.full_name || selectedMember.email)
                    : selectedRole
                        ? `Role: ${selectedRole.display_name}`
                        : null,
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
        setFormData(prev => {
            const newData = { ...prev, [field]: value }
            // If assigning to a specific person, clear role assignment and vice versa
            if (field === 'assigned_to' && value !== '') {
                newData.assigned_role_id = ''
            } else if (field === 'assigned_role_id' && value !== '') {
                newData.assigned_to = ''
            }
            return newData
        })
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Task Title *</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Deliver catering equipment"
                    required
                    className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] rounded-xl"
                />
                {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed description of the task..."
                    rows={3}
                    className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] rounded-xl resize-none"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="task_type" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Task Type</Label>
                    <Select value={formData.task_type} onValueChange={(value) => handleInputChange('task_type', value)}>
                        <SelectTrigger className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                            {taskTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value} className="focus:bg-[var(--dashboard-accent-gold)]/10 focus:text-[var(--dashboard-text)]">
                                    <div className="flex items-center gap-2">
                                        <type.icon className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                        {type.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                            {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value} className="focus:bg-[var(--dashboard-accent-gold)]/10 focus:text-[var(--dashboard-text)]">
                                    <div className="flex items-center gap-2">
                                        <Flag className={`h-4 w-4 ${priority.value === 'urgent' ? 'text-red-400' :
                                            priority.value === 'high' ? 'text-orange-400' :
                                                priority.value === 'medium' ? 'text-yellow-400' :
                                                    'text-zinc-400'
                                            }`} />
                                        {priority.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)]">
                            {statuses.map((status) => (
                                <SelectItem key={status.value} value={status.value} className="focus:bg-[var(--dashboard-accent-gold)]/10 focus:text-[var(--dashboard-text)]">
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="due_date" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Due Date</Label>
                    <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                        className="bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] rounded-xl [color-scheme:dark]"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)]">Assigned To</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between font-normal text-left bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] focus:border-[var(--dashboard-accent-gold)] rounded-xl h-10"
                        >
                            <span className="truncate">
                                {formData.assigned_to
                                    ? teamMembers.find((member) => member.id === formData.assigned_to)?.full_name ||
                                    teamMembers.find((member) => member.id === formData.assigned_to)?.email
                                    : formData.assigned_role_id
                                        ? `Role: ${roles.find(r => r.id === formData.assigned_role_id)?.display_name}`
                                        : "Select team member or role..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[var(--dashboard-background)] border-[var(--dashboard-border)] shadow-2xl" align="start">
                        <Command className="bg-transparent">
                            <CommandInput placeholder="Search people or roles..." className="border-none focus:ring-0 text-[var(--dashboard-text)]" />
                            <CommandEmpty className="text-[var(--dashboard-text-muted)] p-4">No results found.</CommandEmpty>
                            <CommandList className="max-h-[300px]">
                                <CommandGroup>
                                    <CommandItem
                                        value="unassigned-task"
                                        onSelect={() => {
                                            handleInputChange('assigned_to', '')
                                            handleInputChange('assigned_role_id', '')
                                            setOpen(false)
                                        }}
                                        onPointerDown={(e) => e.preventDefault()}
                                        className="text-[var(--dashboard-text)] focus:bg-[var(--dashboard-accent-gold)]/10"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 text-[var(--dashboard-accent-gold)]",
                                                (!formData.assigned_to && !formData.assigned_role_id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        Unassigned
                                    </CommandItem>
                                </CommandGroup>

                                <CommandGroup heading={<span className="text-[var(--dashboard-text-muted)] px-2 text-[10px] font-bold uppercase tracking-widest">Team Members</span>}>
                                    {teamMembers.map((member) => (
                                        <CommandItem
                                            key={member.id}
                                            value={`${member.full_name} ${member.email} ${member.id}`}
                                            onSelect={() => {
                                                handleInputChange('assigned_to', member.id)
                                                setOpen(false)
                                            }}
                                            onPointerDown={(e) => e.preventDefault()}
                                            className="text-[var(--dashboard-text)] focus:bg-[var(--dashboard-accent-gold)]/10"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 text-[var(--dashboard-accent-gold)]",
                                                    formData.assigned_to === member.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{member.full_name || 'Unnamed'}</span>
                                                <span className="text-[10px] text-[var(--dashboard-text-muted)]">{member.email}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>

                                <CommandGroup heading={<span className="text-[var(--dashboard-text-muted)] px-2 text-[10px] font-bold uppercase tracking-widest">Roles</span>}>
                                    {roles.map((role) => (
                                        <CommandItem
                                            key={role.id}
                                            value={`${role.display_name} ${role.id}`}
                                            onSelect={() => {
                                                handleInputChange('assigned_role_id', role.id)
                                                setOpen(false)
                                            }}
                                            onPointerDown={(e) => e.preventDefault()}
                                            className="text-[var(--dashboard-text)] focus:bg-[var(--dashboard-accent-gold)]/10"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4 text-[var(--dashboard-accent-gold)]",
                                                    formData.assigned_role_id === role.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-[var(--dashboard-accent-gold)]" />
                                                <span>{role.display_name}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {errors.submit && (
                <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                    {errors.submit}
                </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-[var(--dashboard-border)]">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)] rounded-xl"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black font-medium rounded-xl px-8 transition-all"
                >
                    {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    )
}
