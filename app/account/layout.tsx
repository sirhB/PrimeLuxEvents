import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountSidebar } from '@/components/account-sidebar'
import { AccountBottomBar } from '@/components/account-bottom-bar'
import { InstallPrompt } from '@/components/pwa/install-prompt'

export const metadata: Metadata = {
  manifest: '/manifest-account.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PrimeLux Portal',
  },
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
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen bg-[var(--linen,#F7F4EF)]">
            <AccountSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <main className="flex-1 p-6 pb-24 md:p-10 md:pb-10">
                    {children}
                </main>
                <AccountBottomBar />
                <InstallPrompt surface="account" />
            </div>
        </div>
    )
}
