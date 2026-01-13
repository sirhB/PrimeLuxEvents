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

        // Check for existing invitation
        const { data: existingInvitation } = await supabase
            .from('user_invitations')
            .select('id, status')
            .eq('email', email.toLowerCase().trim())
            .single()

        if (existingInvitation?.status === 'accepted') {
            return NextResponse.json(
                { error: 'A user with this email has already joined the team' },
                { status: 409 }
            )
        }

        const invitationData = {
            email: email.toLowerCase().trim(),
            role_ids,
            temp_password,
            invitation_token,
            expires_at: expires_at.toISOString(),
            invited_by: user?.id,
            status: 'pending',
            updated_at: new Date().toISOString()
        }

        let result;
        if (existingInvitation) {
            // Update existing invitation
            result = await supabase
                .from('user_invitations')
                .update(invitationData)
                .eq('id', existingInvitation.id)
                .select()
                .single()
        } else {
            // Create new invitation
            result = await supabase
                .from('user_invitations')
                .insert(invitationData)
                .select()
                .single()
        }

        if (result.error) {
            throw result.error
        }

        const data = result.data

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

export async function DELETE(request: NextRequest) {
    try {
        await requirePermission('users.update') // Use users.update for cancelling

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { error } = await supabase
            .from('user_invitations')
            .update({ status: 'cancelled' })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error cancelling invitation:', error)
        return NextResponse.json(
            { error: 'Failed to cancel invitation' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await requirePermission('users.update')

        const body = await request.json()
        const { id, expires_at } = body

        if (!id || !expires_at) {
            return NextResponse.json({ error: 'ID and expires_at are required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { error } = await supabase
            .from('user_invitations')
            .update({
                expires_at,
                status: 'pending' // Reset to pending if it was expired
            })
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error updating invitation:', error)
        return NextResponse.json(
            { error: 'Failed to update invitation' },
            { status: 500 }
        )
    }
}
