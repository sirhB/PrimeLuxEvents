'use client'

import { useAdminSidebar } from '@/components/admin/sidebar-context'
import { ModernSidebar } from '@/components/admin/modern-sidebar'
import { AdminToastProvider } from '@/components/admin/toast-provider'
import { AdminNotifications } from '@/components/admin/notifications'
import dynamic from 'next/dynamic'
const CommandPalette = dynamic(() => import('@/components/admin/command-palette').then(m => m.CommandPalette), { ssr: false })
import { AdminBottomBar } from '@/components/admin/admin-bottom-bar'
import { cn } from '@/lib/utils'
import { Search, User, Command, Menu } from 'lucide-react'
import { useCapacitor } from '@/components/providers/capacitor-provider'
import { useState, useEffect } from 'react'

export function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed, setIsMobileOpen } = useAdminSidebar()
    const { isNative } = useCapacitor()
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsCommandPaletteOpen(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)

        // Apply admin theme class to root for consistent background (important for iOS status bar)
        document.documentElement.classList.add('admin-theme')

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.documentElement.classList.remove('admin-theme')
        }
    }, [])

    return (
        <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--dashboard-background)] text-[var(--dashboard-text)] font-sans admin-theme">
            <div className="print:hidden">
                <ModernSidebar />
            </div>
            <div className={cn(
                "flex flex-1 flex-col transition-all duration-300 max-w-full overflow-x-hidden",
                isCollapsed ? "md:pl-20" : "md:pl-64"
            )}>
                {/* Admin Header / Top Bar */}
                <header className="sticky top-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top))] items-center justify-between border-b border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/80 backdrop-blur-md px-4 md:px-8 pt-[env(safe-area-inset-top)]">
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Mobile Menu Toggle - Only show if not native (native has bottom bar) */}
                        {!isNative && (
                            <button
                                onClick={() => setIsMobileOpen(true)}
                                className="md:hidden p-2 -ml-2 text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)] rounded-lg transition-colors"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        )}
                        <div className="hidden md:flex relative w-64 group cursor-pointer" onClick={() => setIsCommandPaletteOpen(true)}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dashboard-text-muted)] group-hover:text-[var(--dashboard-accent-gold)] transition-colors" />
                            <div className="w-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl py-2 pl-10 pr-4 text-xs text-[var(--dashboard-text-muted)]/50 flex items-center justify-between group-hover:border-[var(--dashboard-accent-gold)]/30 transition-all">
                                <span>Search or command...</span>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/20 border border-white/5 text-[9px]">
                                    <Command className="h-2.5 w-2.5" />
                                    <span>K</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <AdminNotifications />
                        <div className="h-8 w-px bg-[var(--dashboard-border)] mx-1" />
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-bold text-[var(--dashboard-text)] leading-none mb-1">Admin Panel</p>
                                <p className="text-[10px] text-[var(--dashboard-text-muted)] uppercase tracking-wider">Live System</p>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text-muted)]">
                                <User className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden pb-32 md:pb-8 max-w-full">
                    {children}
                </main>
            </div>
            <AdminBottomBar />
            <AdminToastProvider />
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
        </div>
    )
}

