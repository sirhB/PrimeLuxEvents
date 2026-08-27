'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { usePwaContext } from '@/components/providers/pwa-provider'
import { fetchIsStaffClient } from '@/lib/auth/roles-shared'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next')
  const { isStandalone } = usePwaContext()

  const isPortalIntent = Boolean(nextParam?.startsWith('/account'))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      const userId = data.user?.id
      const isStaff = userId ? await fetchIsStaffClient(supabase, userId) : false

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--linen,#F7F4EF)] px-4 gap-8 dark:bg-gray-900">
      {isStandalone && (
        <div className="relative h-16 w-48">
          <Image
            src="/images/logo-dark-mode.png"
            alt="PrimeLux Events"
            fill
            className="object-contain dark:hidden"
            priority
          />
          <Image
            src="/images/logo-light-mode.png"
            alt="PrimeLux Events"
            fill
            className="hidden object-contain dark:block"
            priority
          />
        </div>
      )}
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
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
