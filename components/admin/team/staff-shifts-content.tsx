'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { upsertStaffShift, deleteStaffShift } from '@/app/admin/warehouse/actions'
import Link from 'next/link'

interface Shift {
    id: string
    user_id: string
    shift_date: string
    start_time?: string | null
    end_time?: string | null
    notes?: string | null
    user_profiles?: { id: string; full_name: string; email: string } | null
}

interface StaffMember {
    id: string
    full_name: string
    email: string
}

export function StaffShiftsContent() {
    const [weekStart, setWeekStart] = useState(() =>
        format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    )
    const [shifts, setShifts] = useState<Shift[]>([])
    const [staff, setStaff] = useState<StaffMember[]>([])
    const [loading, setLoading] = useState(true)
    const [editDialog, setEditDialog] = useState<{
        userId: string
        userName: string
        date: string
        shift?: Shift
    } | null>(null)
    const [form, setForm] = useState({ startTime: '09:00', endTime: '17:00', notes: '' })

    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(weekStart + 'T12:00:00'), i))

    useEffect(() => {
        loadData()
    }, [weekStart])

    async function loadData() {
        setLoading(true)
        const supabase = createClient()
        const end = format(addDays(new Date(weekStart + 'T12:00:00'), 6), 'yyyy-MM-dd')

        const [shiftsRes, staffRes] = await Promise.all([
            supabase
                .from('staff_shifts')
                .select('*, user_profiles(id, full_name, email)')
                .gte('shift_date', weekStart)
                .lte('shift_date', end),
            supabase.from('user_profiles').select('id, full_name, email').eq('is_active', true),
        ])

        setShifts(shiftsRes.data || [])
        setStaff(staffRes.data || [])
        setLoading(false)
    }

    function getShift(userId: string, date: string) {
        return shifts.find((s) => s.user_id === userId && s.shift_date === date)
    }

    function openEdit(user: StaffMember, date: string) {
        const shift = getShift(user.id, date)
        setEditDialog({ userId: user.id, userName: user.full_name, date, shift })
        setForm({
            startTime: shift?.start_time?.slice(0, 5) || '09:00',
            endTime: shift?.end_time?.slice(0, 5) || '17:00',
            notes: shift?.notes || '',
        })
    }

    async function handleSave() {
        if (!editDialog) return
        const result = await upsertStaffShift({
            userId: editDialog.userId,
            shiftDate: editDialog.date,
            startTime: form.startTime,
            endTime: form.endTime,
            notes: form.notes || undefined,
        })
        if (result.success) {
            toast.success('Shift saved')
            setEditDialog(null)
            loadData()
        } else {
            toast.error(result.error || 'Failed to save shift')
        }
    }

    async function handleDelete() {
        if (!editDialog?.shift) return
        const result = await deleteStaffShift(editDialog.shift.id)
        if (result.success) {
            toast.success('Shift removed')
            setEditDialog(null)
            loadData()
        } else {
            toast.error(result.error || 'Failed to delete shift')
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--dashboard-accent-gold)]/10 text-[var(--dashboard-accent-gold)] border border-[var(--dashboard-accent-gold)]/20">
                        Team
                    </span>
                    <h1 className="text-4xl font-serif font-light text-[var(--dashboard-text)]">Staff Shifts</h1>
                    <p className="text-[var(--dashboard-text-muted)] max-w-lg">
                        Plan who is working each day. Filter warehouse schedule by on-shift staff.
                    </p>
                </div>
                <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/admin/warehouse/schedule">
                        <Calendar className="h-4 w-4 mr-2" />
                        Warehouse Schedule
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4 glass-card p-2 rounded-2xl w-fit">
                <Button variant="ghost" size="icon" onClick={() => setWeekStart(format(subWeeks(new Date(weekStart + 'T12:00:00'), 1), 'yyyy-MM-dd'))}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-serif min-w-[200px] text-center">
                    Week of {format(new Date(weekStart + 'T12:00:00'), 'MMM d, yyyy')}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setWeekStart(format(addWeeks(new Date(weekStart + 'T12:00:00'), 1), 'yyyy-MM-dd'))}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <Card className="glass-card border-none rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-[var(--dashboard-border)]">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Weekly Grid
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-[var(--dashboard-text-muted)]">Loading...</div>
                    ) : staff.length === 0 ? (
                        <div className="p-12 text-center text-[var(--dashboard-text-muted)]">No active staff found.</div>
                    ) : (
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-[var(--dashboard-border)]">
                                    <th className="p-4 text-left text-xs uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                        Staff
                                    </th>
                                    {weekDays.map((day) => (
                                        <th key={day.toISOString()} className="p-4 text-center text-xs uppercase tracking-widest text-[var(--dashboard-text-muted)]">
                                            {format(day, 'EEE')}
                                            <br />
                                            <span className="text-[var(--dashboard-text)]">{format(day, 'M/d')}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((member) => (
                                    <tr key={member.id} className="border-b border-[var(--dashboard-border)] hover:bg-black/5">
                                        <td className="p-4 font-medium text-sm">{member.full_name}</td>
                                        {weekDays.map((day) => {
                                            const dateStr = format(day, 'yyyy-MM-dd')
                                            const shift = getShift(member.id, dateStr)
                                            return (
                                                <td key={dateStr} className="p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(member, dateStr)}
                                                        className={`w-full min-h-[48px] rounded-xl text-xs transition-colors ${
                                                            shift
                                                                ? 'bg-[var(--dashboard-accent-gold)]/10 border border-[var(--dashboard-accent-gold)]/30 text-[var(--dashboard-accent-gold)]'
                                                                : 'border border-dashed border-[var(--dashboard-border)] hover:bg-black/10 text-[var(--dashboard-text-muted)]'
                                                        }`}
                                                    >
                                                        {shift ? (
                                                            <>
                                                                {shift.start_time?.slice(0, 5)}–{shift.end_time?.slice(0, 5)}
                                                            </>
                                                        ) : (
                                                            '+'
                                                        )}
                                                    </button>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
                <DialogContent className="bg-[var(--dashboard-background)] border-[var(--dashboard-border)]">
                    <DialogHeader>
                        <DialogTitle className="font-serif font-light">
                            {editDialog?.shift ? 'Edit' : 'Add'} Shift — {editDialog?.userName}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-[var(--dashboard-text-muted)]">
                            {editDialog?.date && format(new Date(editDialog.date + 'T12:00:00'), 'EEEE, MMMM d')}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start</Label>
                                <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="rounded-xl" />
                            </div>
                            <div>
                                <Label>End</Label>
                                <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="rounded-xl" />
                            </div>
                        </div>
                        <div>
                            <Label>Notes</Label>
                            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl" placeholder="Optional" />
                        </div>
                        <div className="flex justify-between gap-2">
                            {editDialog?.shift && (
                                <Button variant="destructive" onClick={handleDelete} className="rounded-xl">
                                    Remove
                                </Button>
                            )}
                            <div className="flex gap-2 ml-auto">
                                <Button variant="outline" onClick={() => setEditDialog(null)} className="rounded-xl">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="rounded-xl bg-[var(--dashboard-accent-gold)] text-black">
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
