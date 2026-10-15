'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BrandLockup } from '@/components/brand/brand-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { completePasswordChange } from '@/app/actions/complete-password-change'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    const result = await completePasswordChange(password)
    setLoading(false)
    if (!result.success) {
      toast.error(result.error || 'Could not update the password')
      return
    }
    toast.success('Password updated')
    router.push('/admin')
    router.refresh()
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--linen)] px-4 gap-8">
      <Link href="/" aria-label="Prime Lux Events" className="inline-flex">
        <BrandLockup className="text-[1.7rem]" />
      </Link>
      <Card className="w-full max-w-md border-border/60 bg-white/90 shadow-xl">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Choose a new password</CardTitle>
          <CardDescription>
            This account is using a temporary password. Set a new one before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving…' : 'Save password'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleSignOut}>
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
