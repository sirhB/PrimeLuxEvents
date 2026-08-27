'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { createWarehouseTask } from '@/app/admin/warehouse/actions'
import {
    WAREHOUSE_CATEGORIES,
    WAREHOUSE_CATEGORY_LABELS,
    type WarehouseCategory,
} from '@/lib/warehouse/types'

interface CreateWarehouseTaskDialogProps {
    defaultDate?: string
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function CreateWarehouseTaskDialog({
    defaultDate,
    onSuccess,
    trigger,
}: CreateWarehouseTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [staff, setStaff] = useState<Array<{ id: string; full_name: string }>>([])
    const [roles, setRoles] = useState<Array<{ id: string; name: string; display_name: string }>>([])
    const [form, setForm] = useState({
        title: '',
        description: '',
        warehouseCategory: 'general' as WarehouseCategory,
        dueDate: defaultDate || new Date().toISOString().split('T')[0],
        scheduledStart: '',
        estimatedMinutes: '',
        assignedTo: '',
        assignedRoleId: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    })

    useEffect(() => {
        if (open) {
            const supabase = createClient()
            supabase
                .from('user_profiles')
                .select('id, full_name')
                .eq('is_active', true)
                .then(({ data }) => setStaff(data || []))
            supabase
                .from('roles')
                .select('id, name, display_name')
                .then(({ data }) => setRoles(data || []))
        }
    }, [open])

    useEffect(() => {
        if (defaultDate) setForm((f) => ({ ...f, dueDate: defaultDate }))
    }, [defaultDate])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!form.title.trim()) {
            toast.error('Title is required')
            return
        }

        setLoading(true)
        const result = await createWarehouseTask({
            title: form.title,
            description: form.description || undefined,
            warehouseCategory: form.warehouseCategory,
            dueDate: form.dueDate,
            scheduledStart: form.scheduledStart || undefined,
            estimatedMinutes: form.estimatedMinutes ? parseInt(form.estimatedMinutes, 10) : undefined,
            assignedTo: form.assignedTo || undefined,
            assignedRoleId: form.assignedRoleId || undefined,
            priority: form.priority,
        })
        setLoading(false)

        if (result.success) {
            toast.success('Task created')
            setOpen(false)
            setForm({
                title: '',
                description: '',
                warehouseCategory: 'general',
                dueDate: defaultDate || new Date().toISOString().split('T')[0],
                scheduledStart: '',
                estimatedMinutes: '',
                assignedTo: '',
                assignedRoleId: '',
                priority: 'medium',
            })
            onSuccess?.()
        } else {
            toast.error(result.error || 'Failed to create task')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[var(--dashboard-accent-gold)] hover:bg-[var(--dashboard-accent-gold)]/90 text-black rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-[var(--dashboard-background)] border-[var(--dashboard-border)]">
                <DialogHeader>
                    <DialogTitle className="font-serif font-light text-2xl">New Warehouse Task</DialogTitle>
                    <DialogDescription>Create a manual or maintenance task for the warehouse team.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Title</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Re-stack Chiavari chairs"
                            className="rounded-xl"
                        />
                    </div>
                    <div>
                        <Label>Category</Label>
                        <Select
                            value={form.warehouseCategory}
                            onValueChange={(v) =>
                                setForm({ ...form, warehouseCategory: v as WarehouseCategory })
                            }
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {WAREHOUSE_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {WAREHOUSE_CATEGORY_LABELS[cat]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div>
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={form.scheduledStart}
                                onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="rounded-xl"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Assign to Staff</Label>
                            <Select
                                value={form.assignedTo || 'none'}
                                onValueChange={(v) =>
                                    setForm({ ...form, assignedTo: v === 'none' ? '' : v, assignedRoleId: '' })
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    {staff.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Or Assign to Role</Label>
                            <Select
                                value={form.assignedRoleId || 'none'}
                                onValueChange={(v) =>
                                    setForm({ ...form, assignedRoleId: v === 'none' ? '' : v, assignedTo: '' })
                                }
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.display_name || r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-[var(--dashboard-accent-gold)] text-black"
                        >
                            {loading ? 'Creating...' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
