'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface InvitationData {
    valid: boolean
    email: string
    role_ids: string[]
    expires_at: string
}

export default function AcceptInvitationPage({ params }: { params: Promise<{ token: string }> }) {
    const [token, setToken] = useState<string>('')
    const [invitation, setInvitation] = useState<InvitationData | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
        fullName: ''
    })
    const router = useRouter()

    useEffect(() => {
        const getToken = async () => {
            const { token: tokenParam } = await params
            setToken(tokenParam)
            await validateInvitation(tokenParam)
        }
        getToken()
    }, [params])

    const validateInvitation = async (invitationToken: string) => {
        try {
            const response = await fetch(`/api/team/invitations/${invitationToken}`)
            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Invalid invitation')
                router.push('/login')
                return
            }

            setInvitation(data)
        } catch (error) {
            console.error('Error validating invitation:', error)
            toast.error('Failed to validate invitation')
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch(`/api/team/invitations/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: formData.password,
                    full_name: formData.fullName || null
                })
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Failed to create account')
                return
            }

            toast.success('Account created successfully! You can now sign in.')
            router.push('/login')

        } catch (error) {
            console.error('Error accepting invitation:', error)
            toast.error('Failed to create account')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!invitation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
                            <p className="text-gray-600 mb-4">
                                This invitation link is invalid or has expired.
                            </p>
                            <Button onClick={() => router.push('/login')}>
                                Go to Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">Welcome to PrimeLux</CardTitle>
                    <CardDescription>
                        Complete your account setup to join the team
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={invitation.email}
                                disabled
                                className="bg-gray-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This email address will be used for your account
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Create a password"
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Must be at least 6 characters long
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    )
}
