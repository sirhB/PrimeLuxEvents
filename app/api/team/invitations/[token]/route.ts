import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = createServiceRoleClient()

        // Find the invitation
        const { data: invitation, error: invitationError } = await supabase
            .from('user_invitations')
            .select('*')
            .eq('invitation_token', token)
            .single()

        if (invitationError || !invitation) {
            return NextResponse.json(
                { error: 'Invalid or expired invitation' },
                { status: 404 }
            )
        }

        // Check if invitation is still valid
        if (invitation.status !== 'pending') {
            return NextResponse.json(
                { error: 'Invitation has already been used or cancelled' },
                { status: 400 }
            )
        }

        if (new Date(invitation.expires_at) < new Date()) {
            // Mark as expired
            await supabase
                .from('user_invitations')
                .update({ status: 'expired' })
                .eq('id', invitation.id)

            return NextResponse.json(
                { error: 'Invitation has expired' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            valid: true,
            email: invitation.email,
            role_ids: invitation.role_ids,
            expires_at: invitation.expires_at,
            requires_temp_password: !!invitation.temp_password
        })

    } catch (error) {
        console.error('Error validating invitation:', error)
        return NextResponse.json(
            { error: 'Failed to validate invitation' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = createServiceRoleClient()
        const body = await request.json()
        const { password, full_name, temp_password } = body

        if (!password || password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Find and validate the invitation
        const { data: invitation, error: invitationError } = await supabase
            .from('user_invitations')
            .select('*')
            .eq('invitation_token', token)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .single()

        if (invitationError || !invitation) {
            return NextResponse.json(
                { error: 'Invalid or expired invitation' },
                { status: 400 }
            )
        }

        // Verify temp password
        if (invitation.temp_password && invitation.temp_password !== temp_password) {
            return NextResponse.json(
                { error: 'Incorrect temporary password' },
                { status: 400 }
            )
        }

        // Create the user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: invitation.email,
            password,
            options: {
                data: {
                    full_name: full_name || null
                }
            }
        })

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            )
        }

        const authUser = authData.user
        if (!authUser) {
            return NextResponse.json(
                { error: 'Failed to create user account' },
                { status: 500 }
            )
        }

        // Create user profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: authUser.id,
                email: invitation.email,
                full_name: full_name || null,
                is_active: true
            })

        if (profileError) {
            console.error('Error creating user profile:', profileError)
            // Continue anyway - profile can be created later
        }

        // Assign roles
        const roleInserts = invitation.role_ids.map((roleId: string) => ({
            user_id: authUser.id,
            role_id: roleId,
            assigned_by: invitation.invited_by
        }))

        const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleInserts)

        if (rolesError) {
            console.error('Error assigning roles:', rolesError)
            // Continue anyway - roles can be assigned later
        }

        // Mark invitation as accepted
        await supabase
            .from('user_invitations')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString()
            })
            .eq('id', invitation.id)

        return NextResponse.json({
            success: true,
            user: {
                id: authUser.id,
                email: authUser.email
            }
        })

    } catch (error) {
        console.error('Error accepting invitation:', error)
        return NextResponse.json(
            { error: 'Failed to accept invitation' },
            { status: 500 }
        )
    }
}
