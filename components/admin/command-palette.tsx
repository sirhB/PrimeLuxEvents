'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock, Command, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ADMIN_QUICK_ACTIONS,
  flattenAdminNav,
  type AdminNavItem,
} from '@/lib/admin/nav'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const RECENT_KEY = 'admin-command-recent'

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recents, setRecents] = useState<string[]>([])
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const navItems = useMemo(() => flattenAdminNav(), [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) setRecents(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const matches = useCallback((item: AdminNavItem, q: string) => {
    const haystack = [item.label, item.href, ...(item.keywords || [])].join(' ').toLowerCase()
    return haystack.includes(q)
  }, [])

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ADMIN_QUICK_ACTIONS
    return ADMIN_QUICK_ACTIONS.filter((item) => matches(item, q))
  }, [query, matches])

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return navItems
    return navItems.filter((item) => matches(item, q))
  }, [query, navItems, matches])

  const recentItems = useMemo(() => {
    if (query.trim()) return []
    return recents
      .map((href) => navItems.find((item) => item.href === href) || ADMIN_QUICK_ACTIONS.find((item) => item.href === href))
      .filter(Boolean) as AdminNavItem[]
  }, [recents, navItems, query])

  const allItems = useMemo(() => {
    if (!query.trim() && recentItems.length) {
      return [...filteredActions, ...recentItems, ...filteredNav.filter((n) => !recentItems.some((r) => r.href === n.href))]
    }
    return [...filteredActions, ...filteredNav]
  }, [filteredActions, filteredNav, recentItems, query])

  const handleSelect = useCallback(
    (item: AdminNavItem) => {
      const next = [item.href, ...recents.filter((h) => h !== item.href)].slice(0, 6)
      setRecents(next)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      router.push(item.href)
      onClose()
    },
    [router, onClose, recents],
  )

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, Math.max(allItems.length - 1, 0)))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && allItems[selectedIndex]) {
        e.preventDefault()
        handleSelect(allItems[selectedIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, allItems, selectedIndex, handleSelect, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
          <motion.button
            type="button"
            aria-label="Close command palette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-[var(--dashboard-radius)] border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] shadow-[var(--dashboard-shadow-lg)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--dashboard-border)] px-4">
              <Search className="h-4 w-4 shrink-0 text-[var(--dashboard-text-muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a page or action…"
                className="h-12 w-full bg-transparent text-sm text-[var(--dashboard-text)] outline-none placeholder:text-[var(--dashboard-text-muted)]"
              />
              <kbd className="hidden items-center gap-1 rounded border border-[var(--dashboard-border)] px-1.5 py-0.5 text-[10px] text-[var(--dashboard-text-muted)] sm:inline-flex">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)] hover:text-[var(--dashboard-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-2">
              {allItems.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-[var(--dashboard-text-muted)]">
                  No matches for “{query}”
                </p>
              )}

              {!query.trim() && recentItems.length > 0 && (
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
                  Recent
                </p>
              )}

              {allItems.map((item, index) => {
                const Icon = item.icon
                const isAction = ADMIN_QUICK_ACTIONS.some((a) => a.href === item.href && a.label === item.label)
                const isRecent = !query.trim() && recentItems.some((r) => r.href === item.href)
                const showSection =
                  (index === 0 && isAction) ||
                  (index === filteredActions.length && !query.trim() && recentItems.length === 0) ||
                  (index === filteredActions.length + recentItems.length && recentItems.length > 0 && !query.trim())

                return (
                  <div key={`${item.href}-${item.label}`}>
                    {showSection && index === 0 && isAction && (
                      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
                        Actions
                      </p>
                    )}
                    {showSection && index === filteredActions.length && !query.trim() && recentItems.length === 0 && (
                      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
                        Pages
                      </p>
                    )}
                    {showSection &&
                      index === filteredActions.length + recentItems.length &&
                      recentItems.length > 0 &&
                      !query.trim() && (
                        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--dashboard-text-muted)]">
                          Pages
                        </p>
                      )}
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                        selectedIndex === index
                          ? 'bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)]'
                          : 'text-[var(--dashboard-text-muted)] hover:bg-[var(--dashboard-card-hover)]/70 hover:text-[var(--dashboard-text)]',
                      )}
                    >
                      {isRecent && !isAction ? (
                        <Clock className="h-4 w-4 shrink-0 opacity-70" />
                      ) : (
                        <Icon className="h-4 w-4 shrink-0 text-[var(--dashboard-accent-gold)]" />
                      )}
                      <span className="flex-1 truncate font-medium">{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
