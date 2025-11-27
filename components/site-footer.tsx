import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react" // Added icons

export function SiteFooter() {
  return (
    <footer className="bg-secondary pt-16 pb-8 border-t border-border print:hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
              PrimeLux Events
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Elevating events with curated rentals and bespoke styling services. Creating timeless memories for life's
              most celebrated moments.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/catalog" className="hover:text-foreground transition-colors">
                  Rental Catalog
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-foreground transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                  The Process
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-foreground transition-colors">
                  Journal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4">Important Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/rental-agreement" className="hover:text-foreground transition-colors">
                  Rental Agreement
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4">Connect</h3>
            <div className="flex gap-4 mb-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              123 Luxury Lane
              <br />
              Beverly Hills, CA 90210
              <br />
              (555) 123-4567
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PrimeLux Events. All rights reserved.</p>
          <p>Designed with elegance.</p>
        </div>
      </div>
    </footer>
  )
}
