'use client'

import Link from "next/link"
import { Menu, Search, X, Phone, Mail, Instagram, Facebook } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartSheet } from "@/components/cart-sheet"
import { usePathname } from "next/navigation"
import { SearchTrigger } from "@/components/search-trigger"
import { SearchModal } from "@/components/search-modal"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

import { PwaBackButton } from "@/components/pwa/pwa-back-button"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)

  const [settings, setSettings] = useState({
    company_email: "info@primeluxevents.com",
    company_phone: "(555) 123-4567"
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)

    async function fetchSettings() {
      const supabase = createClient()
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['company_email', 'company_phone'])

      if (data) {
        const fetchedSettings: any = {}
        data.forEach(item => {
          fetchedSettings[item.key] = item.value
        })
        setSettings(prev => ({
          ...prev,
          ...fetchedSettings
        }))
      }
    }
    fetchSettings()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty('--header-height', `${headerRef.current.offsetHeight}px`)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)

    // Check periodically during transition to ensure smoothness
    const interval = setInterval(updateHeaderHeight, 50)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      updateHeaderHeight()
    }, 600)

    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [scrolled])

  if (pathname?.startsWith('/admin')) {
    return null
  }

  const navLinks = [
    { href: "/catalog", label: "Collection" },
    { href: "/packages", label: "Packages" },
    { href: "/gallery", label: "Portfolio" },
    { href: "/how-it-works", label: "Process" },
    { href: "/about", label: "About" },
  ]

  const isDarkPage = true // All public pages are now dark themed luxury experience
  const headerTheme = scrolled || isDarkPage ? 'dark' : 'light'

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1A1A1A] text-white py-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] relative z-50">
        <div className="container mx-auto flex justify-between items-center">
          <p className="hidden md:block opacity-70">
            Serving the Tri-State Area & New England
          </p>
          <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-end">
            <a href={`tel:${settings.company_phone.replace(/\D/g, '')}`} className="hover:text-gold transition-colors flex items-center gap-2">
              <Phone className="h-3 w-3" /> {settings.company_phone}
            </a>
            <a href={`mailto:${settings.company_email}`} className="hover:text-gold transition-colors flex items-center gap-2">
              <Mail className="h-3 w-3" /> {settings.company_email}
            </a>
          </div>
        </div>
      </div>

      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500 bg-[#1A1A1A]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl",
          scrolled ? "py-3" : "py-6"
        )}
      >

        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <PwaBackButton isDark={headerTheme === 'dark'} />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "hover:bg-gold/10 transition-colors",
                    headerTheme === 'dark' ? "text-white" : "text-black"
                  )}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[400px] bg-[#1A1A1A] border-r border-white/5 p-0 text-white">
                <div className="flex flex-col h-full">
                  <div className="p-8 border-b border-white/5">
                    <Link href="/" onClick={() => setIsOpen(false)} className="font-serif text-2xl font-light tracking-tighter">
                      PrimeLux<span className="text-gold">.</span>
                    </Link>
                  </div>
                  <nav className="flex-1 px-8 py-12 flex flex-col gap-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-4xl font-serif font-light hover:text-gold transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                      className="text-4xl font-serif font-light text-gold"
                    >
                      Inquire
                    </Link>
                  </nav>
                  <div className="p-8 border-t border-white/5 flex gap-6">
                    <Instagram className="h-5 w-5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
                    <Facebook className="h-5 w-5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className={cn(
              "font-serif text-2xl md:text-3xl font-light tracking-tighter transition-colors group-hover:text-gold",
              headerTheme === 'dark' ? "text-white" : "text-black"
            )}>
              PrimeLux<span className="text-gold">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative group",
                  pathname === link.href
                    ? "text-gold"
                    : headerTheme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full",
                  pathname === link.href && "w-full"
                )} />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-6">
            <div className={cn(
              headerTheme === 'dark' ? "text-white" : "text-black"
            )}>
              <SearchTrigger onClick={() => setIsSearchOpen(true)} />
            </div>

            <Link
              href="/contact"
              className={cn(
                "hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full transition-all duration-500 hover:scale-105",
                headerTheme === 'dark'
                  ? "bg-gold text-black hover:bg-white"
                  : "bg-black text-white hover:bg-gold hover:text-black"
              )}
            >
              Inquire
            </Link>

            <div className={cn(
              "relative",
              headerTheme === 'dark' ? "text-white" : "text-black"
            )}>
              <CartSheet />
            </div>
          </div>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
