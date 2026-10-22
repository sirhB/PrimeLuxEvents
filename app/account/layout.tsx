import type { Metadata } from 'next'
import { RouteEnter } from '@/components/motion/route-enter'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountSidebar } from '@/components/account-sidebar'
import { AccountBottomBar } from '@/components/account-bottom-bar'
import { AccountPortalHeader } from '@/components/account-portal-header'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { claimOrdersForCurrentUser } from '@/app/account/actions'
import { getMembership } from '@/lib/membership/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import type { PartnerNavStatus } from '@/components/account-sidebar'

export const metadata: Metadata = {
  manifest: '/manifest-account.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PrimeLux Portal',
  },
}

export const viewport = {
  themeColor: "#f7f5f1",
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

    // Planner nav: members get carts + invoices; former members keep read access to their own
    // invoices (open ones stay payable). Replaces the old Preferred Partner portal.
    const membership = await getMembership(createServiceRoleClient(), user.id).catch(() => null)
    const partnerStatus: PartnerNavStatus =
        !membership || membership.status === 'none' ? 'none' : membership.status === 'active' ? 'member' : 'former'

    const now = new Date()
    const upcomingOrder = orders?.find(
        (order) =>
            order.delivery_date &&
            new Date(order.delivery_date) >= now &&
            order.status !== 'cancelled',
    )

    const displayName = profile?.full_name || user.email?.split('@')[0] || 'Guest'

    return (
        <div className="flex min-h-screen bg-[var(--lux-ivory)] text-[var(--dashboard-text)]">
            <AccountSidebar partnerStatus={partnerStatus} />
            <div className="flex min-w-0 flex-1 flex-col">
                <AccountPortalHeader
                    userName={displayName}
                    upcomingOrderDate={upcomingOrder?.delivery_date}
                    upcomingOrderStatus={upcomingOrder?.status}
                    partnerStatus={partnerStatus}
                />
                <main className="flex-1 p-4 pb-24 sm:p-6 md:p-8 md:pb-10">
                    <RouteEnter>{children}</RouteEnter>
                </main>
                <AccountBottomBar partnerStatus={partnerStatus} />
                <InstallPrompt surface="account" />
            </div>
        </div>
    )
}
