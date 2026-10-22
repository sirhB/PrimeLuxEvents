'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { fetchIsStaffClient } from '@/lib/auth/roles-shared'
import { safeInternalPath } from '@/lib/security/safe-path'
import { assertAuthAttemptAllowed } from '@/app/actions/auth-rate-limit'
import { BrandLockup } from '@/components/brand/brand-logo'
import { signInWithUsername } from '@/app/actions/username-login'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawNext = searchParams.get('next')
  const nextParam = rawNext ? safeInternalPath(rawNext, '/account') : null

  const isPortalIntent = Boolean(nextParam?.startsWith('/account'))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const identifier = email.trim()
    if (identifier && !identifier.includes('@')) {
      // Staff username sign-in, resolved and rate-limited on the server.
      try {
        const result = await signInWithUsername(identifier, password)
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        toast.success('Signed in')
        if (result.mustChangePassword) {
          router.push('/login/change-password')
        } else {
          router.push(nextParam && nextParam.startsWith('/admin') ? nextParam : '/admin')
        }
        router.refresh()
      } catch {
        toast.error('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
      return
    }
    const gate = await assertAuthAttemptAllowed('login')
    if (!gate.ok) {
      toast.error(gate.error)
      setLoading(false)
      return
    }
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      const userId = data.user?.id
      const isStaff = userId ? await fetchIsStaffClient(supabase, userId) : false
      const { data: profile } = userId
        ? await supabase.from('user_profiles').select('must_change_password').eq('id', userId).maybeSingle()
        : { data: null }

      if (profile?.must_change_password) {
        toast.success('Signed in')
        router.push('/login/change-password')
        router.refresh()
        return
      }

      let destination = '/account'
      if (nextParam) {
        if (nextParam.startsWith('/admin') && !isStaff) {
          toast.error('You do not have admin access')
          destination = '/account'
        } else {
          destination = nextParam
        }
      } else if (isStaff) {
        destination = '/admin'
      }

      toast.success('Signed in')
      router.push(destination)
      router.refresh()
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--linen,var(--ink))] px-4 gap-8 dark:bg-gray-900">
      <Link href="/" aria-label="Prime Lux Events" className="inline-flex">
        <BrandLockup className="text-[1.7rem]" />
      </Link>
      <Card className="w-full max-w-md border-border/60 bg-white/90 shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="font-serif text-3xl font-light tracking-tight">
            {isPortalIntent ? 'Portal sign in' : 'Sign in'}
          </CardTitle>
          <CardDescription>
            {isPortalIntent
              ? 'Access your orders, favorites, and appointments.'
              : 'Sign in to your PrimeLux account. Staff are routed to the admin console.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or staff username</Label>
              <Input
                id="email"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="you@example.com or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              New client?{' '}
              <Link
                href={`/signup?next=${encodeURIComponent(nextParam || '/account')}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create a portal account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
