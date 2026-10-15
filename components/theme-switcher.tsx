'use client'

import { useState, useSyncExternalStore } from 'react'
import { Check, Palette } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BRAND_THEMES, DEFAULT_THEME_ID, isBrandThemeId, THEME_STORAGE_KEY } from '@/lib/brand-themes'
import { cn } from '@/lib/utils'

function applyTheme(id: string) {
  document.documentElement.setAttribute('data-theme', id)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id)
  } catch {
    // Private mode can block storage; the attribute still updates this tab.
  }
  const theme = BRAND_THEMES.find((item) => item.id === id)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta && theme) meta.setAttribute('content', theme.canvas)
  window.dispatchEvent(new CustomEvent('primelux-theme', { detail: id }))
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener('primelux-theme', onStoreChange)
  return () => window.removeEventListener('primelux-theme', onStoreChange)
}

function readThemeId() {
  const current = document.documentElement.getAttribute('data-theme')
  return isBrandThemeId(current) ? current : DEFAULT_THEME_ID
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const themeId = useSyncExternalStore(subscribeToTheme, readThemeId, () => DEFAULT_THEME_ID)
  const [open, setOpen] = useState(false)

  const active = BRAND_THEMES.find((item) => item.id === themeId) ?? BRAND_THEMES[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-full border border-current/15 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-black/5',
            className,
          )}
          aria-label={`Color theme, ${active.name}. Change theme.`}
        >
          <Palette className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Theme</span>
          <span className="flex h-4 w-4 overflow-hidden rounded-full border border-black/10" aria-hidden>
            <span className="h-full w-1/2" style={{ background: active.dark }} />
            <span className="h-full w-1/2" style={{ background: active.accent }} />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <p className="px-2 py-1.5 text-xs font-semibold text-[var(--theme-muted)]">Color theme</p>
        <ul className="max-h-80 space-y-0.5 overflow-auto" role="listbox" aria-label="Brand themes">
          {BRAND_THEMES.map((theme) => {
            const selected = theme.id === themeId
            return (
              <li key={theme.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-[var(--theme-card-hover)]',
                    selected && 'bg-[var(--theme-tint-1)]',
                  )}
                  onClick={() => {
                    applyTheme(theme.id)
                    setOpen(false)
                  }}
                >
                  <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-black/10" aria-hidden>
                    <span className="h-full w-1/2" style={{ background: theme.dark }} />
                    <span className="flex w-1/2 flex-col">
                      <span className="h-1/2" style={{ background: theme.accent }} />
                      <span className="h-1/2" style={{ background: theme.canvas }} />
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 font-medium text-[var(--theme-dark)]">{theme.name}</span>
                  {selected && <Check className="h-4 w-4 text-[var(--theme-accent-text)]" aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
