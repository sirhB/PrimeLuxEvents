"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { usePwaContext } from "@/components/providers/pwa-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PwaBackButtonProps {
  className?: string
  isDark?: boolean
  hideOnHomePage?: boolean
}

export function PwaBackButton({ className, isDark, hideOnHomePage = true }: PwaBackButtonProps) {
  const { isStandalone } = usePwaContext()
  const pathname = usePathname()
  const router = useRouter()

  if (!isStandalone) return null
  if (hideOnHomePage && pathname === "/") return null

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "mr-2",
        isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5",
        className,
      )}
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-6 w-6" />
      <span className="sr-only">Go back</span>
    </Button>
  )
}
