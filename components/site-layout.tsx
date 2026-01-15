"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Capacitor } from "@capacitor/core"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCapacitor } from "@/components/providers/capacitor-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

const ThreeBackground = dynamic(
    () => import("@/components/three-background").then((mod) => mod.ThreeBackground),
    { ssr: false }
)

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
            {!isPortal && <ThreeBackground />}
            {!isPortal && !isNative && (
                <div className="print:hidden">
                    <SiteHeader />
                </div>
            )}
            <main className={cn(
                "flex-1",
                isNative && isPortal && "pt-0" // Portal (Admin/Account) already handles safe area in layout-content.tsx
            )}>
                {children}
            </main>
            {!isPortal && !isNative && (
                <div className="print:hidden">
                    <SiteFooter />
                </div>
            )}
            {!isPortal && <Toaster />}
        </div>
    )
}
