import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'
import { isStaffUser } from '@/lib/auth/roles'
import {
  InnovateMobileHeader,
  InnovateSidebar,
} from '@/components/innovate/innovate-sidebar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Innovate | PrimeLux Events',
  description: 'Admin Innovate studios for custom fabrication, lighting, and VIP entry.',
}

export default async function InnovateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/innovate')
  }

  const staff = await isStaffUser(user.id)
  if (!staff) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex min-h-screen bg-[var(--ink)] text-[var(--linen)]">
      <InnovateSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <InnovateMobileHeader />
        <div className="flex-1">{children}</div>
      </div>
      <Toaster richColors theme="dark" position="top-right" />
    </div>
  )
}
