'use client'

import { useTransition } from 'react'
import { PasswordForm } from '@/components/password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { requestAccountDeletion } from '@/app/account/actions'
import { toast } from 'sonner'

export default function SettingsPage() {
    const [pending, startTransition] = useTransition()

    const handleDeleteRequest = () => {
        if (!confirm('Request permanent deletion of your account? Our team will follow up to complete this.')) {
            return
        }
        startTransition(async () => {
            const result = await requestAccountDeletion()
            if (!result.success) {
                toast.error(result.error || 'Request failed')
                return
            }
            toast.success('Deletion request submitted. We will contact you to confirm.')
        })
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-serif font-bold tracking-tight text-primary">Security Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account security and authentication methods.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PasswordForm />
                </CardContent>
            </Card>

            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Permanent actions for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Deleting your account will permanently remove all your data and event history. This action is irreversible.
                    </p>
                    <Button
                        variant="ghost"
                        className="text-sm font-semibold text-destructive hover:underline px-0"
                        disabled={pending}
                        onClick={handleDeleteRequest}
                    >
                        {pending ? 'Submitting...' : 'Request account deletion'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
