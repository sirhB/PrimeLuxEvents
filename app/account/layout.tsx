import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountSidebar } from '@/components/account-sidebar'
import { AccountBottomBar } from '@/components/account-bottom-bar'
import { AccountPortalHeader } from '@/components/account-portal-header'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { claimOrdersForCurrentUser } from '@/app/account/actions'

export const metadata: Metadata = {
  manifest: '/manifest-account.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PrimeLux Portal',
  },
}

export const viewport = {
  themeColor: '#121110',
}

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/account')
    }

    await claimOrdersForCurrentUser()

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const { data: orders } = await supabase
        .from('orders')
        .select('delivery_date, status')
        .eq('user_id', user.id)
        .order('delivery_date', { ascending: true })

    const now = new Date()
    const upcomingOrder = orders?.find(
        (order) =>
            order.delivery_date &&
            new Date(order.delivery_date) >= now &&
            order.status !== 'cancelled',
    )

    const displayName = profile?.full_name || user.email?.split('@')[0] || 'Guest'

    return (
        <div className="flex min-h-screen bg-[var(--linen,#F7F4EF)]">
            <AccountSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <AccountPortalHeader
                    userName={displayName}
                    upcomingOrderDate={upcomingOrder?.delivery_date}
                    upcomingOrderStatus={upcomingOrder?.status}
                />
                <main className="flex-1 p-6 pb-24 md:p-10 md:pb-10">
                    {children}
                </main>
                <AccountBottomBar />
                <InstallPrompt surface="account" />
            </div>
        </div>
    )
}
