'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateEventData {
    name: string
    eventDate: string
    location?: string
    guestCount?: number
    budget?: number
    status?: string
    customerName?: string
    managerName?: string
    notes?: string
}

export interface UpdateEventData {
    name?: string
    eventDate?: string
    location?: string
    guestCount?: number
    budget?: number
    status?: string
    customerName?: string
    managerName?: string
    notes?: string
}

export async function createEvent(data: CreateEventData) {
    try {
        const supabase = await createClient()

        const { data: newEvent, error } = await supabase
            .from('events')
            .insert({
                name: data.name,
                event_date: data.eventDate,
                location: data.location || null,
                guest_count: data.guestCount || null,
                budget: data.budget || null,
                status: data.status || 'planning',
                customer_name: data.customerName || null,
                manager_name: data.managerName || null,
                notes: data.notes || null,
            })
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/events')
        return { success: true, data: newEvent }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateEvent(eventId: string, data: UpdateEventData) {
    try {
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {}

        if (data.name !== undefined) updateData.name = data.name
        if (data.eventDate !== undefined) updateData.event_date = data.eventDate
        if (data.location !== undefined) updateData.location = data.location
        if (data.guestCount !== undefined) updateData.guest_count = data.guestCount
        if (data.budget !== undefined) updateData.budget = data.budget
        if (data.status !== undefined) updateData.status = data.status
        if (data.customerName !== undefined) updateData.customer_name = data.customerName
        if (data.managerName !== undefined) updateData.manager_name = data.managerName
        if (data.notes !== undefined) updateData.notes = data.notes

        const { error } = await supabase.from('events').update(updateData).eq('id', eventId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/events')
        revalidatePath(`/admin/events/${eventId}`)
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function deleteEvent(eventId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('events').delete().eq('id', eventId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/events')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateEventStatus(eventId: string, status: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('events').update({ status }).eq('id', eventId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/events')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}
