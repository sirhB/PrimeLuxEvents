'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Command, Menu, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminSidebar } from '@/components/admin/sidebar-context'
import { ModernSidebar } from '@/components/admin/modern-sidebar'
import { AdminToastProvider } from '@/components/admin/toast-provider'
import { AdminNotifications } from '@/components/admin/notifications'
import { AdminBottomBar } from '@/components/admin/admin-bottom-bar'
import { usePwaContext } from '@/components/providers/pwa-provider'
import { InstallPrompt } from '@/components/pwa/install-prompt'

const CommandPalette = dynamic(
  () => import('@/components/admin/command-palette').then((m) => m.CommandPalette),
  { ssr: false },
)

export function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isImmersiveEditor = pathname?.startsWith('/admin/visual-editor')
  const { isCollapsed, setIsMobileOpen } = useAdminSidebar()
  const { isStandalone } = usePwaContext()
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.documentElement.classList.add('admin-theme')

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.documentElement.classList.remove('admin-theme')
    }
  }, [])

  if (isImmersiveEditor) {
    return (
      <div className="admin-theme flex min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--dashboard-background)] font-sans text-[var(--dashboard-text)]">
        {children}
        <AdminToastProvider />
      </div>
    )
  }

  return (
    <div className="admin-theme flex min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--dashboard-background)] font-sans text-[var(--dashboard-text)]">
      <div className="print:hidden">
        <ModernSidebar />
      </div>

      <div
        className={cn(
          'flex max-w-full flex-1 flex-col overflow-x-hidden transition-[padding] duration-300',
          isCollapsed ? 'md:pl-[4.5rem]' : 'md:pl-60',
        )}
      >
        <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] items-center justify-between gap-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-background)]/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-md sm:px-5 md:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-2">
            {!isStandalone && (
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="-ml-1 rounded-md p-2 text-[var(--dashboard-text-muted)] transition-colors hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)] md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="group relative hidden w-72 cursor-pointer items-center md:flex"
            >
              <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[var(--dashboard-text-muted)] transition-colors group-hover:text-[var(--dashboard-accent-gold)]" />
              <span className="flex w-full items-center justify-between rounded-md border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] py-2 pl-9 pr-3 text-xs text-[var(--dashboard-text-muted)] transition-colors group-hover:border-[var(--dashboard-accent-gold)]/35">
                Search pages and actions…
                <kbd className="inline-flex items-center gap-0.5 rounded border border-[var(--dashboard-border)] bg-black/20 px-1.5 py-0.5 text-[9px]">
                  <Command className="h-2.5 w-2.5" />
                  K
                </kbd>
              </span>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="rounded-md p-2 text-[var(--dashboard-text-muted)] transition-colors hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)] md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <AdminNotifications />
          </div>
        </header>

        <main className="max-w-full flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 pb-24 sm:px-5 sm:py-5 md:px-6 md:pb-8">
          {children}
        </main>
      </div>

      <AdminBottomBar />
      <AdminToastProvider />
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <InstallPrompt surface="admin" />
    </div>
  )
}
