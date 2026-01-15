'use client'

import React, { useState } from 'react'
import { Camera, QrCode, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { ScanModal } from '@/components/admin/scan-modal'
import { useCapacitor } from '@/components/providers/capacitor-provider'
import { useAdminSidebar } from '@/components/admin/sidebar-context'
import { cn } from '@/lib/utils'

export function MobileAdminFAB() {
    const pathname = usePathname()
    const { isNative } = useCapacitor()
    const { setIsMobileOpen } = useAdminSidebar()
    const [isScanOpen, setIsScanOpen] = useState(false)

    // Only show in admin pages and hide on the scan page itself
    if (!pathname.startsWith('/admin') || pathname === '/admin/scan') {
        return null
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 md:hidden flex flex-col gap-4">
            {/* Show Menu button only on Web (non-native) */}
            {!isNative && (
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full bg-white text-black shadow-2xl hover:bg-gray-100 transition-all active:scale-95 border border-gray-200"
                    onClick={() => setIsMobileOpen(true)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            )}

            <Button
                size="icon"
                className={cn(
                    "h-16 w-16 rounded-full bg-black text-white shadow-2xl hover:bg-gold hover:text-black transition-all active:scale-95 border-none",
                    !isNative && "h-14 w-14" // Slightly smaller if there's a menu button
                )}
                onClick={() => setIsScanOpen(true)}
            >
                <QrCode className={cn("h-8 w-8", !isNative && "h-6 w-6")} />
            </Button>
            <ScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
        </div>
    )
}
