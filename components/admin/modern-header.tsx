'use client'

import { Search, Bell, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)]" />
                    <Input
                        placeholder="Search..."
                        className="pl-10 w-64 bg-[var(--dashboard-card)] border-none text-[var(--dashboard-text)] placeholder:text-[var(--dashboard-text-muted)] rounded-full focus-visible:ring-1 focus-visible:ring-[var(--dashboard-accent-gold)]"
                    />
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
