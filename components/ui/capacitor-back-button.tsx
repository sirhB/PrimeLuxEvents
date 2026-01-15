"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useCapacitor } from "@/components/providers/capacitor-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CapacitorBackButtonProps {
    className?: string
    isDark?: boolean
    hideOnHomePage?: boolean
}

export function CapacitorBackButton({ className, isDark, hideOnHomePage = true }: CapacitorBackButtonProps) {
    const { isNative } = useCapacitor()
    const pathname = usePathname()
    const router = useRouter()

    // Only show on native apps
    if (!isNative) {
        return null
    }

    // Optionally hide on home page (for public site)
    if (hideOnHomePage && pathname === "/") {
        return null
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "mr-2",
                isDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5",
                className
            )}
            onClick={() => router.back()}
        >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Go back</span>
        </Button>
    )
}
