"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, Phone, Mail } from "lucide-react"
import { getSiteContent } from "@/lib/content"
import { ContactForm } from "@/components/contact-form"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function ContactPage() {
  const [content, setContent] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      const data = await getSiteContent()
      setContent(data)
      setLoading(false)
    }
    loadContent()
  }, [])

  if (loading) return null

  return (
    <section className="py-24 md:py-32 bg-background min-h-screen">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground">Request a Consultation</h1>
              <p className="text-xl text-muted-foreground max-w-md font-light leading-relaxed">
                {content['contact.hero.description']}
              </p>
            </div>

            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50 group-hover:border-gold/50 transition-colors">
                  <MapPin className="h-5 w-5 text-foreground group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2">{content['contact.info.address.title']}</h3>
                  <p className="text-muted-foreground whitespace-pre-line text-lg font-light">
                    {content['contact.info.address.value']}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50 group-hover:border-gold/50 transition-colors">
                  <Phone className="h-5 w-5 text-foreground group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2">{content['contact.info.phone.title']}</h3>
                  <p className="text-muted-foreground text-lg font-light">{content['contact.info.phone.value']}</p>
                  <p className="text-sm text-muted-foreground mt-1">{content['contact.info.phone.hours']}</p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50 group-hover:border-gold/50 transition-colors">
                  <Mail className="h-5 w-5 text-foreground group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2">{content['contact.info.email.title']}</h3>
                  <p className="text-muted-foreground text-lg font-light">{content['contact.info.email.value']}</p>
                </div>
              </div>
            </div>

            <div className="h-64 w-full bg-secondary rounded-sm overflow-hidden relative border border-border/50">
              {/* Map Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-muted-foreground/5">
                <span className="text-muted-foreground font-medium uppercase tracking-widest">Map View</span>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-secondary/20 p-8 md:p-12 rounded-sm border border-border/50 hover:border-gold/30 transition-colors shadow-xl"
          >
            <h2 className="text-3xl font-serif mb-8 text-foreground">{content['contact.form.title']}</h2>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
