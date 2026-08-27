"use client"

import { usePathname } from "next/navigation"
import { Toaster } from "sonner"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { cn } from "@/lib/utils"

export function SiteLayout({
  children,
  header,
  footer,
}: {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const isAccount = pathname?.startsWith("/account")
  const isPortal = isAdmin || isAccount

  return (
    <div className="ambient-bg flex min-h-screen flex-col">
      {!isPortal && header}
      <main className={cn("relative z-[1] flex-1")}>{children}</main>
      {!isPortal && footer}
      {!isPortal && <Toaster />}
      {!isPortal && <InstallPrompt surface="store" />}
    </div>
  )
}
