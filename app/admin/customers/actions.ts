'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateCustomerData {
    name: string
    email: string
    phone?: string
    companyName?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    notes?: string
}

export interface UpdateCustomerData {
    name?: string
    email?: string
    phone?: string
    companyName?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    notes?: string
}

export async function createCustomer(data: CreateCustomerData) {
    try {
        const supabase = await createClient()

        // Check if customer already exists
        const { data: existing } = await supabase
            .from('customers')
            .select('id')
            .eq('email', data.email)
            .single()

        if (existing) {
            return { success: false, error: 'Customer with this email already exists' }
        }

        const { data: newCustomer, error } = await supabase
            .from('customers')
            .insert({
                name: data.name,
                email: data.email,
                phone: data.phone || null,
                company_name: data.companyName || null,
                address: data.address || null,
                city: data.city || null,
                state: data.state || null,
                zip_code: data.zipCode || null,
                country: data.country || null,
                notes: data.notes || null,
            })
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/customers')
        return { success: true, data: newCustomer }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function updateCustomer(customerId: string, data: UpdateCustomerData) {
    try {
        const supabase = await createClient()

        const updateData: Record<string, unknown> = {}

        if (data.name !== undefined) updateData.name = data.name
        if (data.email !== undefined) updateData.email = data.email
        if (data.phone !== undefined) updateData.phone = data.phone
        if (data.companyName !== undefined) updateData.company_name = data.companyName
        if (data.address !== undefined) updateData.address = data.address
        if (data.city !== undefined) updateData.city = data.city
        if (data.state !== undefined) updateData.state = data.state
        if (data.zipCode !== undefined) updateData.zip_code = data.zipCode
        if (data.country !== undefined) updateData.country = data.country
        if (data.notes !== undefined) updateData.notes = data.notes

        const { error } = await supabase.from('customers').update(updateData).eq('id', customerId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/customers')
        revalidatePath(`/admin/customers/${customerId}`)
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}

export async function deleteCustomer(customerId: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('customers').delete().eq('id', customerId)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/admin/customers')
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: message }
    }
}
