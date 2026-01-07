import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#1A1A1A] text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <Link href="/" className="font-serif text-3xl font-light tracking-tighter group">
              PrimeLux<span className="text-gold group-hover:text-white transition-colors">.</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-light">
              Elevating life's most celebrated moments with curated rentals and bespoke styling services. We believe every event deserves a touch of extraordinary.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gold transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Navigation</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Rental Catalog
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Event Packages
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  The Process
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Support</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/rental-agreement" className="hover:text-white transition-colors">Rental Agreement</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Get in Touch</h3>
            <ul className="space-y-6 text-sm text-gray-400 font-light">
              <li className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-gold shrink-0" />
                <span>123 Luxury Lane, Suite 100<br />Beverly Hills, CA 90210</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-gold shrink-0" />
                <a href="tel:5551234567" className="hover:text-white transition-colors">(555) 123-4567</a>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <a href="mailto:info@primeluxevents.com" className="hover:text-white transition-colors">info@primeluxevents.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <p>&copy; {new Date().getFullYear()} PrimeLux Events. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/admin" className="hover:text-gold transition-colors">Admin Portal</Link>
            <p>Designed with elegance</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
