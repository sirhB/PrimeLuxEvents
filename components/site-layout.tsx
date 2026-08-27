"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export function SiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith("/admin")
    const isAccount = pathname?.startsWith("/account")
    const isPortal = isAdmin || isAccount

    return (
        <div className="ambient-bg flex min-h-screen flex-col">
            {!isPortal && (
                <div className="print:hidden">
                    <SiteHeader />
                </div>
            )}
            <main className={cn("relative z-[1] flex-1")}>
                {children}
            </main>
            {!isPortal && (
                <div className="print:hidden">
                    <SiteFooter />
                </div>
            )}
            {!isPortal && <Toaster />}
            {!isPortal && <InstallPrompt surface="store" />}
        </div>
    )
}
