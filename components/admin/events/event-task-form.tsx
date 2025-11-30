'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Calendar, User, Flag } from 'lucide-react'

interface TaskFormData {
    title: string
    description: string
    status: string
    priority: string
    assigned_to: string
    due_date: string
}

interface EventTaskFormProps {
    eventId: string
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

export function EventTaskForm({ eventId, task, onSuccess, onCancel }: EventTaskFormProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'pending',
        priority: task?.priority || 'medium',
        assigned_to: task?.assigned_to || '',
        due_date: task?.due_date || ''
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

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
        const supabase = createClient()

        try {
            const taskData = {
                ...formData,
                event_id: eventId,
                updated_at: new Date().toISOString()
            }

            if (task?.id) {
                // Update existing task
                const { error } = await supabase
                    .from('event_tasks')
                    .update(taskData)
                    .eq('id', task.id)

                if (error) throw error
            } else {
                // Create new task
                const { error } = await supabase
                    .from('event_tasks')
                    .insert({
                        ...taskData,
                        created_by: 'admin' // This should come from auth context
                    })

                if (error) throw error
            }

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
                    placeholder="Venue walkthrough and final confirmation"
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
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {priorities.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                    <div className="flex items-center gap-2">
                                        <Flag className={`h-4 w-4 ${
                                            priority.value === 'urgent' ? 'text-red-500' :
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
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Input
                        id="assigned_to"
                        value={formData.assigned_to}
                        onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                        placeholder="Maya Brooks"
                    />
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
