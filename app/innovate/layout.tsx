import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { hasPermission } from '@/lib/auth/authorization'
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
  const allowed = await hasPermission('innovate.view')
  if (!allowed) {
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
