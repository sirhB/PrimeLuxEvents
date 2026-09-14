'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { innovateNavItems, isInnovateRouteActive } from '@/lib/innovate/nav'

export function InnovateNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex flex-col gap-1 px-3 py-4', className)}>
      {innovateNavItems.map((item) => {
        const active = isInnovateRouteActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-start gap-3 rounded-sm px-3 py-2.5 transition-colors duration-200',
              active
                ? 'bg-[var(--ink)] text-[var(--linen)]'
                : 'text-[var(--ink)]/70 hover:bg-[var(--ink)]/5 hover:text-[var(--ink)]',
            )}
          >
            <item.icon
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0 transition-colors',
                active
                  ? 'text-[var(--champagne)]'
                  : 'text-[var(--ink)]/45 group-hover:text-[var(--champagne)]',
              )}
            />
            <span className="min-w-0">
              <span className="block font-medium leading-tight">{item.title}</span>
              <span
                className={cn(
                  'mt-0.5 block text-[11px] leading-snug',
                  active ? 'text-[var(--linen)]/65' : 'text-[var(--ink)]/45',
                )}
              >
                {item.description}
              </span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function InnovateSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-[var(--ink)]/10 bg-[var(--linen)] text-[var(--ink)] md:flex">
      <div className="flex h-16 items-center border-b border-[var(--ink)]/10 px-5">
        <Link href="/innovate" className="font-serif text-xl tracking-wide">
          Innovate<span className="text-[var(--champagne)]">.</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <InnovateNav />
      </div>
      <div className="border-t border-[var(--ink)]/10 p-4">
        <Link
          href="/admin"
          className="flex w-full items-center gap-2 px-2 py-2 text-sm text-[var(--ink)]/70 transition-colors hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>
      </div>
    </aside>
  )
}

export function InnovateMobileHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--ink)]/10 bg-[var(--linen)]/95 px-4 backdrop-blur md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-1 rounded-sm p-2 text-[var(--ink)]/70"
        aria-label="Open Innovate menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link href="/innovate" className="font-serif text-lg">
        Innovate<span className="text-[var(--champagne)]">.</span>
      </Link>
      <Link href="/admin" className="text-xs uppercase tracking-wider text-[var(--ink)]/55">
        Admin
      </Link>

      {open ? (
        <div className="fixed inset-0 z-50 bg-[var(--ink)]/40" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-[var(--linen)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-[var(--ink)]/10 px-4">
              <span className="font-serif text-lg">Innovate</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-sm p-2 text-[var(--ink)]/70"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <InnovateNav onNavigate={() => setOpen(false)} className="flex-1 overflow-auto" />
            <div className="border-t border-[var(--ink)]/10 p-4">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm text-[var(--ink)]/70"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
