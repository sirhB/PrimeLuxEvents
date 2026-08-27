'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserCog,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAdminSidebar } from './sidebar-context'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { haptics } from '@/lib/utils/haptics'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ADMIN_NAV_GROUPS,
  isAdminRouteActive,
  type AdminNavItem,
} from '@/lib/admin/nav'

function SidebarItem({
  item,
  isActive,
  isCollapsed,
  onClick,
}: {
  item: AdminNavItem
  isActive: boolean
  isCollapsed: boolean
  onClick?: () => void
}) {
  const Icon = item.icon

  const content = (
    <Link
      href={item.href}
      onClick={() => {
        haptics.impact()
        onClick?.()
      }}
      className={cn(
        'relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)]'
          : 'text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)]/70 hover:text-[var(--dashboard-text)]',
      )}
    >
      {isActive && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-[var(--dashboard-rail)] -translate-y-1/2 rounded-r-full bg-[var(--dashboard-accent-gold)]"
        />
      )}
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0',
          isActive ? 'text-[var(--dashboard-accent-gold)]' : 'opacity-80',
        )}
      />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] text-[var(--dashboard-text)]"
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

function SidebarSection({
  title,
  items,
  isCollapsed,
  pathname,
  onItemClick,
}: {
  title: string
  items: AdminNavItem[]
  isCollapsed: boolean
  pathname: string
  onItemClick: () => void
}) {
  const isActiveGroup = items.some((item) => isAdminRouteActive(pathname, item.href))
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (isActiveGroup) setIsOpen(true)
  }, [isActiveGroup])

  if (isCollapsed) {
    return (
      <div className="mb-2 space-y-0.5 border-t border-[var(--dashboard-border)]/60 pt-2 first:border-0 first:pt-0">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={isAdminRouteActive(pathname, item.href)}
            isCollapsed
            onClick={onItemClick}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="mb-0.5 flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dashboard-text-muted)] transition-colors hover:bg-[var(--dashboard-card)]/60 hover:text-[var(--dashboard-text)]"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform', !isOpen && '-rotate-90 opacity-50')}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="space-y-0.5 overflow-hidden"
          >
            {items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={isAdminRouteActive(pathname, item.href)}
                isCollapsed={false}
                onClick={onItemClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ModernSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useAdminSidebar()
  const [user, setUser] = useState<{ email?: string; fullName?: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!mounted || !authUser) return
      setUser({
        email: authUser.email,
        fullName: authUser.user_metadata?.full_name as string | undefined,
      })
    }
    void loadUser()
    return () => {
      mounted = false
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Staff'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[70] flex flex-col border-r border-[var(--dashboard-border)] bg-[var(--dashboard-surface)] transition-[width,transform] duration-300 ease-out',
          isCollapsed ? 'md:w-[4.5rem]' : 'md:w-60',
          'w-60',
          'md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--dashboard-border)] px-3">
          <Link
            href="/admin"
            className={cn(
              'flex min-w-0 items-center gap-2.5 overflow-hidden',
              isCollapsed && !isMobileOpen && 'md:justify-center',
            )}
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--dashboard-accent-gold)] text-sm font-bold text-[#121110]">
              P
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 leading-tight">
                <p className="truncate font-serif text-lg text-[var(--dashboard-text)]">PrimeLux</p>
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
                  Ops
                </p>
              </div>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'hidden h-8 w-8 text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)] md:flex',
              isCollapsed && 'mx-auto',
            )}
            onClick={() => {
              haptics.impact()
              setIsCollapsed(!isCollapsed)
            }}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[var(--dashboard-text-muted)] md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2 pb-8 scrollbar-thin">
          {ADMIN_NAV_GROUPS.map((group) => (
            <SidebarSection
              key={group.title}
              title={group.title}
              items={group.items}
              isCollapsed={isCollapsed && !isMobileOpen}
              pathname={pathname}
              onItemClick={() => setIsMobileOpen(false)}
            />
          ))}
        </nav>

        <div className="shrink-0 border-t border-[var(--dashboard-border)] p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md p-2 text-left outline-none transition-colors hover:bg-[var(--dashboard-card-hover)]',
                  isCollapsed && !isMobileOpen && 'justify-center',
                )}
              >
                <Avatar className="h-8 w-8 border border-[var(--dashboard-border)]">
                  <AvatarFallback className="bg-[var(--dashboard-card)] text-[10px] font-semibold text-[var(--dashboard-text-muted)]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {(!isCollapsed || isMobileOpen) && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--dashboard-text)]">{displayName}</p>
                    <p className="truncate text-[10px] text-[var(--dashboard-text-muted)]">
                      {user?.email || 'Signed in'}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isCollapsed ? 'right' : 'top'}
              align={isCollapsed ? 'start' : 'center'}
              className="w-56 border-[var(--dashboard-border)] bg-[var(--dashboard-card)] text-[var(--dashboard-text)]"
            >
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-[var(--dashboard-card-hover)]">
                <Link href="/admin/team">
                  <UserCog className="mr-2 h-4 w-4" />
                  Staff
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-[var(--dashboard-card-hover)]">
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--dashboard-border)]" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-[var(--dashboard-accent-red)] focus:bg-[var(--dashboard-accent-red)]/10 focus:text-[var(--dashboard-accent-red)]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </TooltipProvider>
  )
}
