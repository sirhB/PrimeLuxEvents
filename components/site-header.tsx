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

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would redirect to search results
    setIsSearchOpen(false)
    router.push("/catalog")
  }

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
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
              <nav className="flex flex-col gap-6 mt-10">
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
                  Contact
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
          {isSearchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="absolute inset-x-0 top-0 h-20 bg-background flex items-center px-4 md:px-6 z-50 animate-fade-in"
            >
              <Search className="h-5 w-5 text-muted-foreground mr-4" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search for chairs, tables, decor..."
                className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg h-full bg-transparent"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="hidden md:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <Link
            href="/contact"
            className="hidden md:inline-flex text-sm font-medium uppercase tracking-widest hover:text-muted-foreground transition-colors"
          >
            Start Quote
          </Link>
          <CartSheet />
        </div>
      </div>
    </header>
  )
}
