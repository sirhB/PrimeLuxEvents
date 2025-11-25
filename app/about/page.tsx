"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"

export default function AboutPage() {
  const [content, setContent] = useState<any>({})
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    // Fetch content client-side
    import("@/lib/content-client").then((mod) => {
      mod.getSiteContent().then(setContent)
    })
  }, [])

  const values = content['about.values.items'] || []

  return (
    <>
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-muted">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src={content['about.hero.image'] || "/luxury-event-setup-ballroom-chandelier.jpg"}
            alt="Luxury Event Setup"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </motion.div>
        <motion.div
          style={{ opacity }}
          className="container relative z-10 text-center text-white space-y-6 max-w-3xl px-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-serif font-medium tracking-tight"
          >
            {content['about.hero.title']}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl font-light text-white/90 max-w-2xl mx-auto"
          >
            {content['about.hero.description']}
          </motion.p>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-serif">{content['about.story.title']}</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>{content['about.story.p1']}</p>
                <p>{content['about.story.p2']}</p>
                <p>{content['about.story.p3']}</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] md:aspect-square bg-muted rounded-sm overflow-hidden"
            >
              <Image
                src={content['about.story.image'] || "/elegant-wedding-reception-table-setting.jpg"}
                alt="Our Story Image"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">{content['about.values.title']}</h2>
            <p className="text-muted-foreground">
              {content['about.values.description']}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-background p-8 rounded-sm border border-border/50 hover:border-primary/20 transition-colors"
              >
                <h3 className="text-xl font-serif mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="container px-4 md:px-6 text-center space-y-8 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-serif"
          >
            {content['about.cta.title']}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-primary-foreground/80 text-lg max-w-2xl mx-auto"
          >
            {content['about.cta.description']}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button asChild size="lg" variant="secondary" className="min-w-[200px] hover:scale-105 transition-transform">
              <Link href="/catalog">{content['about.cta.primary']}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-w-[200px] bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:scale-105 transition-all"
            >
              <Link href="/contact">{content['about.cta.secondary']}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  )
}
