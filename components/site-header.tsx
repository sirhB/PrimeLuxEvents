'use client'

import Link from 'next/link'
import { Menu, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CartSheet } from '@/components/cart-sheet'
import { SearchTrigger } from '@/components/search-trigger'
import { SearchModal } from '@/components/search-modal'
import { cn } from '@/lib/utils'
import { PwaBackButton } from '@/components/pwa/pwa-back-button'
import { COMPANY } from '@/lib/company'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { BrandMonogram } from '@/components/brand/brand-logo'
import { useCart } from '@/components/providers/cart-provider'

const LINKS = [
  { href: '/catalog', label: 'Rentals' },
  { href: '/packages', label: 'Packages' },
  { href: '/venues', label: 'Venues' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
]

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { openPlan, hasLead } = useCart()
  const links = LINKS
  const onHero = pathname === '/' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const header = document.querySelector('[data-site-header]')
    if (!header) return
    const write = () => {
      document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`)
    }
    write()
    window.addEventListener('resize', write)
    return () => window.removeEventListener('resize', write)
  }, [scrolled])

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <header
        data-site-header
        className={cn(
          'sticky top-0 z-50 border-b transition-colors',
          onHero
            ? 'border-transparent bg-[var(--suite-paper)]/80 backdrop-blur-md'
            : 'border-[var(--theme-dark)]/10 bg-[var(--suite-paper)]/95 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-6">
          <div className="flex items-center lg:hidden">
            <PwaBackButton isDark={false} />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="text-[var(--theme-dark)]">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full bg-[var(--suite-paper)] p-0 sm:w-[380px]">
                <div className="flex h-full flex-col">
                  <div className="border-b border-[var(--theme-dark)]/10 p-6">
                    <Link href="/" onClick={() => setIsOpen(false)} aria-label="Prime Lux Events" className="brand-lockup inline-flex">
                      <BrandMonogram className="h-12" />
                    </Link>
                  </div>
                  <nav className="flex flex-1 flex-col gap-5 px-6 py-8">
                    {links.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="font-serif text-4xl font-medium">
                        {link.label}
                      </Link>
                    ))}
                    <button type="button" onClick={() => { setIsOpen(false); openPlan() }} className="text-left font-serif text-4xl font-medium italic">
                      {hasLead ? 'Your event' : 'Plan your event'}
                    </button>
                    <ThemeSwitcher />
                  </nav>
                  <a href={`tel:${COMPANY.phone.replace(/\D/g, '')}`} className="flex items-center gap-2 border-t border-[var(--theme-dark)]/10 px-6 py-5 text-sm">
                    <Phone className="h-4 w-4" /> {COMPANY.phone}
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" aria-label="Prime Lux Events" className="brand-lockup brand-monogram-strong inline-flex">
            <BrandMonogram className="h-14 md:h-14" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[11px] uppercase tracking-[0.22em]',
                  pathname === link.href ? 'text-[var(--theme-dark)]' : 'text-[var(--theme-muted)] hover:text-[var(--theme-dark)]',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <SearchTrigger onClick={() => setIsSearchOpen(true)} />
            <ThemeSwitcher className="hidden h-9 px-2 lg:inline-flex" />
            <button type="button" onClick={() => openPlan()} className="hidden text-[11px] uppercase tracking-[0.2em] md:inline">
              {hasLead ? 'Your event' : 'Plan'}
            </button>
            <CartSheet />
          </div>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
