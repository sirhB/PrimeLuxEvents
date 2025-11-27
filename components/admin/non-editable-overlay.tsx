"use client"

import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface NonEditableOverlayProps {
    isEditing: boolean
    children: React.ReactNode
    message?: string
    className?: string
}

export function NonEditableOverlay({
    isEditing,
    children,
    message = "This section is not editable in visual mode",
    className
}: NonEditableOverlayProps) {
    if (!isEditing) {
        return <>{children}</>
    }

    return (
        <div className={cn("relative group", className)}>
            <div className="filter blur-[2px] pointer-events-none select-none opacity-50 transition-all duration-300 group-hover:blur-[4px] group-hover:opacity-40">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/80 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 transform scale-95 group-hover:scale-100 transition-transform duration-300">
                    <div className="p-2 bg-white/10 rounded-full">
                        <Lock className="w-4 h-4 text-gold" />
                    </div>
                    <span className="font-medium text-sm">{message}</span>
                </div>
            </div>
        </div>
    )
}
