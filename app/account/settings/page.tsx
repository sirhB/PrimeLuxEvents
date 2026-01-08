import { PasswordForm } from '@/components/password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
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
                    <button className="text-sm font-semibold text-destructive hover:underline">
                        Request account deletion
                    </button>
                </CardContent>
            </Card>
        </div>
    )
}
