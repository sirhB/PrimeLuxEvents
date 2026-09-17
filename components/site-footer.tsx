"use client"

import Link from "next/link"
import { Instagram, Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { COMPANY } from "@/lib/company"

export function SiteFooter() {
  const [settings, setSettings] = useState({
    company_address: COMPANY.addressMultiline,
    company_email: COMPANY.email,
    company_phone: COMPANY.phone,
  })

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient()
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['company_address', 'company_email', 'company_phone'])

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
  }, [])

  return (
    <footer className="bg-[var(--ink)] text-white pt-20 pb-10 overflow-hidden relative border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="font-serif text-3xl font-light tracking-tighter group">
              PrimeLux<span className="text-gold group-hover:text-foreground transition-colors">.</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs font-light">
              Luxury party rentals and event styling from Shelton, CT — serving Connecticut, Rhode Island, and Massachusetts.
            </p>
            <div className="flex gap-6">
              <a
                href={COMPANY.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Navigation</h3>
            <ul className="space-y-4 text-sm text-muted-foreground font-light">
              <li>
                <Link href="/catalog" className="hover:text-foreground transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Rental Catalog
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-foreground transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Event Packages
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-foreground transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-foreground transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  The Process
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors flex items-center group">
                  <ArrowRight className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Support</h3>
            <ul className="space-y-4 text-sm text-muted-foreground font-light">
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/rental-agreement" className="hover:text-foreground transition-colors">Rental Agreement</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Get in Touch</h3>
            <ul className="space-y-6 text-sm text-muted-foreground font-light">
              <li className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-gold shrink-0" />
                <span className="whitespace-pre-line">{settings.company_address}</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-gold shrink-0" />
                <a href={`tel:${settings.company_phone.replace(/\D/g, '')}`} className="hover:text-foreground transition-colors">{settings.company_phone}</a>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <a href={`mailto:${settings.company_email}`} className="hover:text-foreground transition-colors">{settings.company_email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PrimeLux Events. All rights reserved.</p>
          <div className="flex gap-8">
            <p>Shelton, Connecticut</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
