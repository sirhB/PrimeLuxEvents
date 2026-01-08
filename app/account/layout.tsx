import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountSidebar } from '@/components/account-sidebar'

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
        <div className="flex min-h-screen bg-muted/20">
            <AccountSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-6 md:p-10">
                    {children}
                </main>
            </div>
        </div>
    )
}
