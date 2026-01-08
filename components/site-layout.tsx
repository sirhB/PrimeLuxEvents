"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export function SiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith("/admin")
    const isAccount = pathname?.startsWith("/account")
    const isPortal = isAdmin || isAccount

    return (
        <div className="flex flex-col min-h-screen">
            {!isPortal && (
                <div className="print:hidden">
                    <SiteHeader />
                </div>
            )}
            <main className="flex-1">{children}</main>
            {!isPortal && (
                <div className="print:hidden">
                    <SiteFooter />
                </div>
            )}
        </div>
    )
}
