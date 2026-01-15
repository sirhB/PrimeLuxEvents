"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Capacitor } from "@capacitor/core"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCapacitor } from "@/components/providers/capacitor-provider"

export function SiteLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { isNative } = useCapacitor()
    const isAdmin = pathname?.startsWith("/admin")
    const isAccount = pathname?.startsWith("/account")
    const isPortal = isAdmin || isAccount

    useEffect(() => {
        // If running on native app (iOS/Android), only allow admin-related routes
        if (Capacitor.isNativePlatform()) {
            const isAllowedRoute =
                pathname?.startsWith("/admin") ||
                pathname?.startsWith("/login") ||
                pathname?.startsWith("/auth") ||
                pathname === "/unauthorized"

            if (!isAllowedRoute) {
                router.replace("/admin")
            }
        }
    }, [pathname, router])

    return (
        <div className="flex flex-col min-h-screen">
            {!isPortal && !isNative && (
                <div className="print:hidden">
                    <SiteHeader />
                </div>
            )}
            <main className="flex-1">{children}</main>
            {!isPortal && !isNative && (
                <div className="print:hidden">
                    <SiteFooter />
                </div>
            )}
        </div>
    )
}
