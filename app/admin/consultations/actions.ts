'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addCommunication(
    consultationId: string,
    type: 'call' | 'email' | 'text' | 'note',
    content: string
) {
    const supabase = await createClient()

    // Get current user (admin)
    const {
        data: { user },
    } = await supabase.auth.getUser()
    const createdBy = user?.email || 'Admin'

    const { error } = await supabase.from('consultation_communications').insert({
        consultation_id: consultationId,
        type,
        content,
        created_by: createdBy,
    })

    if (error) {
        throw new Error(`Failed to add communication: ${error.message}`)
    }

    revalidatePath(`/admin/consultations/${consultationId}`)
}

export async function scheduleAppointment(
    consultationId: string,
    appointmentDate: string,
    appointmentTime: string,
    location: string,
    notes?: string
) {
    const supabase = await createClient()

    // Get current user (admin)
    const {
        data: { user },
    } = await supabase.auth.getUser()
    const createdBy = user?.email || 'Admin'

    // Get consultation to get client info
    const { data: consultation } = await supabase
        .from('consultations')
        .select('customer_name, customer_email, customer_phone')
        .eq('id', consultationId)
        .single()

    if (!consultation) {
        throw new Error('Consultation not found')
    }

    // Create appointment linked to consultation
    const { error: appointmentError } = await supabase.from('appointments').insert({
        consultation_id: consultationId,
        client_name: consultation.customer_name,
        client_email: consultation.customer_email,
        client_phone: consultation.customer_phone,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        location: location || null,
        notes: notes || null,
        status: 'scheduled',
        created_by: createdBy,
    })

    if (appointmentError) {
        throw new Error(`Failed to create appointment: ${appointmentError.message}`)
    }

    // Update consultation status to appointment_confirmed
    const { error: updateError } = await supabase
        .from('consultations')
        .update({ status: 'appointment_confirmed', updated_at: new Date().toISOString() })
        .eq('id', consultationId)

    if (updateError) {
        throw new Error(`Failed to update consultation status: ${updateError.message}`)
    }

    revalidatePath(`/admin/consultations/${consultationId}`)
    revalidatePath('/admin/appointments')
}

export async function deleteConsultation(consultationId: string) {
    const supabase = await createClient()

    // Delete related communications first (CASCADE should handle this, but being explicit)
    await supabase.from('consultation_communications').delete().eq('consultation_id', consultationId)

    // Delete consultation (appointments will have consultation_id set to null due to ON DELETE SET NULL)
    const { error } = await supabase.from('consultations').delete().eq('id', consultationId)

    if (error) {
        throw new Error(`Failed to delete consultation: ${error.message}`)
    }

    revalidatePath('/admin/consultations')
    redirect('/admin/consultations')
}

