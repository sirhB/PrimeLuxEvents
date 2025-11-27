'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateAppointmentData {
    consultationId?: string | null
    clientName: string
    clientEmail?: string | null
    clientPhone?: string | null
    appointmentDate: string
    appointmentTime: string
    location?: string | null
    notes?: string | null
}

export interface UpdateAppointmentData {
    clientName?: string
    clientEmail?: string | null
    clientPhone?: string | null
    appointmentDate?: string
    appointmentTime?: string
    location?: string | null
    notes?: string | null
    status?: 'scheduled' | 'completed' | 'cancelled'
}

export async function createAppointment(data: CreateAppointmentData) {
    const supabase = await createClient()

    // Get current user (admin)
    const {
        data: { user },
    } = await supabase.auth.getUser()
    const createdBy = user?.email || 'Admin'

    const { error } = await supabase.from('appointments').insert({
        consultation_id: data.consultationId || null,
        client_name: data.clientName,
        client_email: data.clientEmail || null,
        client_phone: data.clientPhone || null,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        location: data.location || null,
        notes: data.notes || null,
        status: 'scheduled',
        created_by: createdBy,
    })

    if (error) {
        throw new Error(`Failed to create appointment: ${error.message}`)
    }

    // If linked to consultation, update consultation status
    if (data.consultationId) {
        await supabase
            .from('consultations')
            .update({ status: 'appointment_confirmed', updated_at: new Date().toISOString() })
            .eq('id', data.consultationId)
        revalidatePath(`/admin/consultations/${data.consultationId}`)
    }

    revalidatePath('/admin/appointments')
}

export async function updateAppointment(appointmentId: string, data: UpdateAppointmentData) {
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    }

    if (data.clientName !== undefined) updateData.client_name = data.clientName
    if (data.clientEmail !== undefined) updateData.client_email = data.clientEmail
    if (data.clientPhone !== undefined) updateData.client_phone = data.clientPhone
    if (data.appointmentDate !== undefined) updateData.appointment_date = data.appointmentDate
    if (data.appointmentTime !== undefined) updateData.appointment_time = data.appointmentTime
    if (data.location !== undefined) updateData.location = data.location
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.status !== undefined) updateData.status = data.status

    const { error } = await supabase.from('appointments').update(updateData).eq('id', appointmentId)

    if (error) {
        throw new Error(`Failed to update appointment: ${error.message}`)
    }

    // Get appointment to check if linked to consultation
    const { data: appointment } = await supabase
        .from('appointments')
        .select('consultation_id')
        .eq('id', appointmentId)
        .single()

    if (appointment?.consultation_id) {
        revalidatePath(`/admin/consultations/${appointment.consultation_id}`)
    }

    revalidatePath('/admin/appointments')
    revalidatePath(`/admin/appointments/${appointmentId}`)
}

export async function deleteAppointment(appointmentId: string) {
    const supabase = await createClient()

    // Get appointment to check if linked to consultation
    const { data: appointment } = await supabase
        .from('appointments')
        .select('consultation_id')
        .eq('id', appointmentId)
        .single()

    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId)

    if (error) {
        throw new Error(`Failed to delete appointment: ${error.message}`)
    }

    // If was linked to consultation, we might want to update consultation status
    // but we'll leave that for now - admin can manually update if needed

    if (appointment?.consultation_id) {
        revalidatePath(`/admin/consultations/${appointment.consultation_id}`)
    }

    revalidatePath('/admin/appointments')
}

export async function updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'completed' | 'cancelled') {
    const supabase = await createClient()

    const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId)

    if (error) {
        throw new Error(`Failed to update appointment status: ${error.message}`)
    }

    revalidatePath('/admin/appointments')
    revalidatePath(`/admin/appointments/${appointmentId}`)
}

