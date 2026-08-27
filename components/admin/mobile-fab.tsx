'use client'

import React, { useState } from 'react'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { ScanModal } from '@/components/admin/scan-modal'

export function MobileAdminFAB() {
    const pathname = usePathname()
    const [isScanOpen, setIsScanOpen] = useState(false)

    if (!pathname.startsWith('/admin') || pathname === '/admin/scan') {
        return null
    }

    return (
        <div className="fixed bottom-24 right-6 z-50 md:hidden">
            <Button
                size="icon"
                className="h-14 w-14 rounded-full border-none bg-black text-white shadow-2xl transition-all hover:bg-[var(--champagne,#B8956B)] hover:text-black active:scale-95"
                onClick={() => setIsScanOpen(true)}
            >
                <QrCode className="h-6 w-6" />
            </Button>
            <ScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
        </div>
    )
}
