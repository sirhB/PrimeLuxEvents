'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useCapacitor } from '@/components/providers/capacitor-provider'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { isNative } = useCapacitor()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        console.log('Attempting login for:', email)
        const supabase = createClient()

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('Login error:', error)
                toast.error(error.message)
                return
            }

            console.log('Login successful:', data)
            toast.success('Login successful! Redirecting...')

            // Wait a moment before redirecting to ensure cookies are set
            setTimeout(() => {
                console.log('Redirecting to /admin...')
                router.push('/admin')
                router.refresh()
            }, 1000)
        } catch (error) {
            console.error('Unexpected error:', error)
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-900 gap-8">
            {isNative && (
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
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                    <CardDescription>
                        Enter your email and password to access the admin dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
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
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
