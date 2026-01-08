'use client'

import React from 'react'
import { Camera, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileAdminFAB() {
    const pathname = usePathname()

    // Only show in admin pages and hide on the scan page itself
    if (!pathname.startsWith('/admin') || pathname === '/admin/scan') {
        return null
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
            <Link href="/admin/scan">
                <Button
                    size="icon"
                    className="h-16 w-16 rounded-full bg-black text-white shadow-2xl hover:bg-gold hover:text-black transition-all active:scale-95 border-none"
                >
                    <QrCode className="h-8 w-8" />
                </Button>
            </Link>
        </div>
    )
}
