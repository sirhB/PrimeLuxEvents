'use client'

import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminSearch } from '@/components/admin-search'

export function ModernHeader() {
    return (
        <header className="flex items-center justify-between py-6 px-8 bg-[var(--dashboard-background)]">
            <div>
                <h1 className="text-3xl font-bold text-[var(--dashboard-text)]">
                    Welcome, Admin!
                </h1>
                <p className="text-[var(--dashboard-text-muted)] mt-1">
                    Manage your store and view insights.
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:block">
                    <AdminSearch />
                </div>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-[var(--dashboard-card)] text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)] relative"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--dashboard-accent-orange)]" />
                </Button>

                {/* Profile */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-gradient-to-r from-[var(--dashboard-accent-gold)] to-[var(--dashboard-accent-blue)] text-white hover:opacity-90"
                >
                    <User className="h-5 w-5" />
                </Button>
            </div>
        </header>
    )
}
