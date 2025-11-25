"use client"

import type React from "react"

import Link from "next/link"
import { Menu, Search, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartSheet } from "@/components/cart-sheet"
import { Input } from "@/components/ui/input"
import { useRouter, usePathname } from "next/navigation"
import { SearchTrigger } from "@/components/search-trigger"
import { SearchModal } from "@/components/search-modal"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()


  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <div className="bg-primary text-primary-foreground py-2.5 px-4 text-xs font-medium relative z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
          <p className="hidden md:block tracking-wide">
            We serve Connecticut, New York, New Jersey, Massachusetts and Rhode Island.
          </p>
          <div className="flex items-center gap-6 w-full md:w-auto justify-center md:justify-end tracking-wider">
            <a href="tel:5551234567" className="hover:opacity-80 transition-opacity flex items-center gap-2">
              (555) 123-4567
            </a>
            <a href="mailto:info@primeluxevents.com" className="hover:opacity-80 transition-opacity flex items-center gap-2">
              info@primeluxevents.com
            </a>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background border-r border-border">
                <nav className="flex flex-col gap-6 mt-10 px-4">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-serif hover:text-muted-foreground transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/catalog"
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-serif hover:text-muted-foreground transition-colors"
                  >
                    Rental Catalog
                  </Link>
                  <Link
                    href="/gallery"
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-serif hover:text-muted-foreground transition-colors"
                  >
                    Portfolio
                  </Link>
                  <Link
                    href="/how-it-works"
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-serif hover:text-muted-foreground transition-colors"
                  >
                    Process
                  </Link>
                  <Link
                    href="/journal"
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-serif hover:text-muted-foreground transition-colors"
                  >
                    Journal
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-serif hover:text-muted-foreground transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-serif hover:text-muted-foreground transition-colors"
                  >
                    Request Consultation
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-xl md:text-2xl font-bold tracking-tight">PrimeLux Events</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/catalog"
              className="text-sm font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors"
            >
              Rental Catalog
            </Link>
            <Link
              href="/gallery"
              className="text-sm font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors"
            >
              Portfolio
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors"
            >
              Process
            </Link>
            <Link
              href="/journal"
              className="text-sm font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors"
            >
              Journal
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <SearchTrigger onClick={() => setIsSearchOpen(true)} />

            <Link
              href="/contact"
              className="hidden md:inline-flex text-sm font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors"
            >
              Request Consultation
            </Link>
            <CartSheet />
          </div>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
