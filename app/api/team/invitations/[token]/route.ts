import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = createServiceRoleClient()

        const { data: invitation, error: invitationError } = await supabase
            .from('user_invitations')
            .select('id, email, role_ids, expires_at, status')
            .eq('invitation_token', token)
            .single()

        if (invitationError || !invitation) {
            return NextResponse.json(
                { error: 'Invalid or expired invitation' },
                { status: 404 }
            )
        }

        if (invitation.status !== 'pending') {
            return NextResponse.json(
                { error: 'Invitation has already been used or cancelled' },
                { status: 400 }
            )
        }

        if (new Date(invitation.expires_at) < new Date()) {
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
        const { password, full_name } = body

        if (!password || password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

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

        // Possession of the invitation token is sufficient — no secondary plaintext password
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: invitation.email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: full_name || null
            }
        })

        if (authError) {
            // Fall back to signUp if admin API is unavailable
            const { data: signupData, error: signupError } = await supabase.auth.signUp({
                email: invitation.email,
                password,
                options: {
                    data: {
                        full_name: full_name || null
                    }
                }
            })
            if (signupError) {
                return NextResponse.json(
                    { error: signupError.message || authError.message },
                    { status: 400 }
                )
            }
            if (!signupData.user) {
                return NextResponse.json(
                    { error: 'Failed to create user account' },
                    { status: 500 }
                )
            }
            return await finalizeInvitation(supabase, invitation, signupData.user, full_name)
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user account' },
                { status: 500 }
            )
        }

        return await finalizeInvitation(supabase, invitation, authData.user, full_name)

    } catch (error) {
        console.error('Error accepting invitation:', error)
        return NextResponse.json(
            { error: 'Failed to accept invitation' },
            { status: 500 }
        )
    }
}

async function finalizeInvitation(
    supabase: ReturnType<typeof createServiceRoleClient>,
    invitation: { id: string; email: string; role_ids: string[]; invited_by: string | null },
    authUser: { id: string; email?: string | null },
    fullName?: string | null
) {
    const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
            id: authUser.id,
            email: invitation.email,
            full_name: fullName || null,
            is_active: true
        }, { onConflict: 'id' })

    if (profileError) {
        console.error('Error creating user profile:', profileError)
    }

    if (Array.isArray(invitation.role_ids) && invitation.role_ids.length > 0) {
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
        }
    }

    // Clear any legacy plaintext temp_password and mark accepted
    const { error: updateError } = await supabase
        .from('user_invitations')
        .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            temp_password: null,
        })
        .eq('id', invitation.id)

    if (updateError) {
        console.error('Error updating invitation status:', updateError)
        return NextResponse.json(
            { error: 'Failed to complete invitation process' },
            { status: 500 }
        )
    }

    return NextResponse.json({
        success: true,
        user: {
            id: authUser.id,
            email: authUser.email
        }
    })
}
