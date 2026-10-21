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
import { SuiteToggle } from '@/components/suite/suite-toggle'
import { useSuite } from '@/components/suite/use-suite'

const VENUE_LINKS = [
  { href: '/venues', label: 'Venues' },
  { href: '/plan', label: 'Plan' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
]

const RENTAL_LINKS = [
  { href: '/catalog', label: 'Collection' },
  { href: '/packages', label: 'Packages' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
]

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { suite } = useSuite()
  const links = suite === 'venue' ? VENUE_LINKS : RENTAL_LINKS
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
  }, [suite, scrolled])

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
                    <Link href="/plan" onClick={() => setIsOpen(false)} className="font-serif text-4xl font-medium italic">
                      Plan your event
                    </Link>
                    <Link href={suite === 'venue' ? '/catalog' : '/venues'} onClick={() => setIsOpen(false)} className="text-sm uppercase tracking-[0.18em] text-[var(--theme-muted)]">
                      {suite === 'venue' ? 'Rentals collection' : 'Venue rooms'}
                    </Link>
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
            <div className="hidden lg:block">
              <SuiteToggle />
            </div>
            <SearchTrigger onClick={() => setIsSearchOpen(true)} />
            <ThemeSwitcher className="hidden h-9 px-2 lg:inline-flex" />
            <Link href="/plan" className="hidden text-[11px] uppercase tracking-[0.2em] md:inline">
              Plan
            </Link>
            <CartSheet />
          </div>
        </div>
        <div className="flex justify-center border-t border-[var(--theme-dark)]/10 px-4 py-2 lg:hidden">
          <SuiteToggle />
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
