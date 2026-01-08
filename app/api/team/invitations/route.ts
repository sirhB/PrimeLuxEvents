import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/authorization'

export async function POST(request: NextRequest) {
    try {
        // Require permission to invite users
        await requirePermission('users.create')

        const supabase = await createClient()
        const body = await request.json()
        const { email, role_ids, temp_password } = body

        if (!email || !role_ids || !Array.isArray(role_ids) || role_ids.length === 0) {
            return NextResponse.json(
                { error: 'Email and at least one role are required' },
                { status: 400 }
            )
        }

        // Generate invitation token and expiry
        const invitation_token = crypto.randomUUID()
        const expires_at = new Date()
        expires_at.setDate(expires_at.getDate() + 7) // 7 days

        // Get current user for invited_by
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('user_invitations')
            .insert({
                email: email.toLowerCase().trim(),
                role_ids,
                temp_password,
                invitation_token,
                expires_at: expires_at.toISOString(),
                invited_by: user?.id
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return NextResponse.json(
                    { error: 'An invitation for this email already exists' },
                    { status: 409 }
                )
            }
            throw error
        }

        // TODO: Send invitation email
        // For now, just return success with the invitation details

        return NextResponse.json({
            success: true,
            invitation: {
                id: data.id,
                email: data.email,
                expires_at: data.expires_at,
                invitation_token: data.invitation_token
            }
        })

    } catch (error) {
        console.error('Error creating invitation:', error)
        return NextResponse.json(
            { error: 'Failed to create invitation' },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        // Require permission to view invitations
        await requirePermission('users.view')

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('user_invitations')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ invitations: data || [] })

    } catch (error) {
        console.error('Error fetching invitations:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invitations' },
            { status: 500 }
        )
    }
}
