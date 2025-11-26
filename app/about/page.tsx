"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSiteContent } from "@/lib/content"
import { motion } from "framer-motion"
import { use, useState, useEffect } from "react"

export default function AboutPage() {
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

  const values = content['about.values.items'] || []

  if (loading) return null

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image
            src={content['about.hero.image'] || "/luxury-event-setup-ballroom-chandelier.jpg"}
            alt="Luxury Event Setup"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
        <div className="container relative z-10 text-center text-white space-y-6 max-w-4xl px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif font-medium tracking-tight"
          >
            {content['about.hero.title']}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-2xl font-light text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            {content['about.hero.description']}
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">
                {content['about.story.title']}
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-light">
                <p>{content['about.story.p1']}</p>
                <p>{content['about.story.p2']}</p>
                <p>{content['about.story.p3']}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] md:aspect-square bg-secondary rounded-sm overflow-hidden shadow-2xl"
            >
              <Image
                src={content['about.story.image'] || "/elegant-wedding-reception-table-setting.jpg"}
                alt="Our Story Image"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 border border-white/10 m-4 rounded-sm pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-secondary/20 border-y border-border/40">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-foreground">{content['about.values.title']}</h2>
            <p className="text-xl text-muted-foreground font-light">
              {content['about.values.description']}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-background p-10 rounded-sm border border-border/40 hover:border-gold/30 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 group"
              >
                <h3 className="text-2xl font-serif mb-4 text-foreground group-hover:text-gold transition-colors">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-gold text-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="container px-4 md:px-6 text-center space-y-10 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-serif"
          >
            {content['about.cta.title']}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-black/80 text-xl max-w-2xl mx-auto font-light"
          >
            {content['about.cta.description']}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center pt-6"
          >
            <Button asChild size="lg" className="min-w-[200px] bg-black text-white hover:bg-black/80 h-14 text-lg rounded-full border-2 border-transparent">
              <Link href="/catalog">{content['about.cta.primary']}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[200px] bg-transparent border-2 border-black/20 text-black hover:bg-black hover:text-white h-14 text-lg rounded-full"
            >
              <Link href="/contact">{content['about.cta.secondary']}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  )
}
