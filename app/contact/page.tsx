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
import { ContactForm } from "@/components/contact-form"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function ContactPage() {
  const [content, setContent] = useState<any>({})

  useEffect(() => {
    import("@/lib/content-client").then((mod) => {
      mod.getSiteContent().then(setContent)
    })
  }, [])

  const contactInfo = [
    {
      icon: MapPin,
      title: content['contact.info.address.title'],
      value: content['contact.info.address.value'],
      multiline: true,
    },
    {
      icon: Phone,
      title: content['contact.info.phone.title'],
      value: content['contact.info.phone.value'],
      extra: content['contact.info.phone.hours'],
    },
    {
      icon: Mail,
      title: content['contact.info.email.title'],
      value: content['contact.info.email.value'],
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Info */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight">Request a Consultation</h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {content['contact.hero.description']}
              </p>
            </motion.div>

            <div className="space-y-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <info.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{info.title}</h3>
                    <p className={`text-muted-foreground ${info.multiline ? 'whitespace-pre-line' : ''}`}>
                      {info.value}
                    </p>
                    {info.extra && (
                      <p className="text-sm text-muted-foreground mt-1">{info.extra}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-64 w-full bg-muted rounded-sm overflow-hidden relative"
            >
              {/* Map Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-muted-foreground/10">
                <span className="text-muted-foreground font-medium">Map View</span>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="bg-muted/30 p-8 md:p-12 rounded-sm border border-border/50"
          >
            <h2 className="text-2xl font-serif mb-6">{content['contact.form.title']}</h2>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
