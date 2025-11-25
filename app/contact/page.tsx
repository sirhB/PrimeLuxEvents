'use client'

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
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { getSiteContent } from "@/lib/content"
import { ContactForm } from "@/components/contact-form"

export default function ContactPage() {
  const [content, setContent] = useState<any>({})

  useEffect(() => {
    getSiteContent().then(setContent)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced Hero Section */}
      <ContactHeroSection
        title="Request a Consultation"
        description={content['contact.hero.description']}
      />

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="py-20 md:py-32 bg-background"
      >
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Enhanced Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-12"
            >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-4xl md:text-6xl font-serif font-medium tracking-tight"
              >
                Request a Consultation
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg text-muted-foreground max-w-md"
              >
                {content['contact.hero.description']}
              </motion.p>
            </motion.div>

            <div className="space-y-8">
              <ContactInfoCard
                icon={<MapPin className="h-5 w-5" />}
                title={content['contact.info.address.title']}
                content={content['contact.info.address.value']}
                delay={0.7}
              />

              <ContactInfoCard
                icon={<Phone className="h-5 w-5" />}
                title={content['contact.info.phone.title']}
                content={`${content['contact.info.phone.value']}\n${content['contact.info.phone.hours']}`}
                delay={0.8}
              />

              <ContactInfoCard
                icon={<Mail className="h-5 w-5" />}
                title={content['contact.info.email.title']}
                content={content['contact.info.email.value']}
                delay={0.9}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="h-64 w-full bg-muted rounded-lg overflow-hidden relative shadow-lg"
            >
              {/* Enhanced Map Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-muted-foreground/10 hover:bg-muted-foreground/20 transition-colors duration-300 cursor-pointer">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-muted-foreground font-medium"
                >
                  Interactive Map View
                </motion.span>
              </div>

              {/* Subtle loading animation */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              />
            </motion.div>
          </motion.div>

          {/* Enhanced Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-muted/30 p-8 md:p-12 rounded-lg border border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-2xl font-serif mb-6"
            >
              {content['contact.form.title']}
            </motion.h2>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </motion.section>
    </motion.div>
  )
}

// Enhanced Contact Hero Section with Parallax Effects
function ContactHeroSection({ title, description }: { title: string; description: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <div ref={containerRef} className="relative h-[60vh] min-h-[500px] w-full overflow-hidden bg-black">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
      </motion.div>

      <div className="relative container mx-auto h-full flex flex-col justify-center items-center text-center px-4 md:px-6 z-10">
        <motion.div
          style={{ opacity }}
          className="max-w-4xl space-y-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white tracking-tight leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="flex flex-col items-center gap-4 pt-4"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">Get In Touch</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-12 bg-gradient-to-b from-white/0 via-white/40 to-white/0"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Enhanced Contact Info Card Component
function ContactInfoCard({
  icon,
  title,
  content,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.02, x: 4 }}
      className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 cursor-pointer group"
    >
      <motion.div
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ duration: 0.2 }}
        className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </motion.div>

      <div className="flex-1">
        <motion.h3
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 0.1 }}
          className="font-medium mb-1 group-hover:text-primary transition-colors"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: delay + 0.2 }}
          className="text-muted-foreground whitespace-pre-line group-hover:text-muted-foreground/80 transition-colors"
        >
          {content}
        </motion.p>
      </div>
    </motion.div>
  )
}
