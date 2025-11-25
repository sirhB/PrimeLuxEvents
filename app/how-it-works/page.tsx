"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"

export default function HowItWorksPage() {
  const [content, setContent] = useState<any>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  })

  useEffect(() => {
    import("@/lib/content").then((mod) => {
      mod.getSiteContent().then(setContent)
    })
  }, [])

  const steps = content['howitworks.steps.list'] || []
  const faqs = content['howitworks.faq.list'] || []

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-serif font-medium tracking-tight"
          >
            {content['howitworks.hero.title']}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl font-light text-muted-foreground max-w-2xl mx-auto"
          >
            {content['howitworks.hero.description']}
          </motion.p>
        </div>
      </section>

      {/* Steps Section with Progress Line */}
      <section ref={containerRef} className="py-20 bg-background relative">
        {/* Progress line - desktop only */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-primary origin-top"
        />

        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:gap-24">
            {steps.map((step: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              >
                {/* Image - alternates left/right on desktop */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`relative aspect-video lg:aspect-[4/3] bg-muted rounded-sm overflow-hidden ${index % 2 === 1 ? 'lg:order-2' : ''}`}
                >
                  {step.image && (
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </motion.div>

                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-serif"
                  >
                    {index + 1}
                  </motion.div>
                  <h2 className="text-3xl font-serif">{step.title}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="bg-muted p-6 rounded-sm border border-border/50"
                  >
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Key Details
                    </h3>
                    <ul className="space-y-3">
                      {step.details?.map((detail: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground text-sm flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-2 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Concierge Service */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-serif">{content['howitworks.concierge.title']}</h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                {content['howitworks.concierge.description']}
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-4 hover:scale-105 transition-transform">
                <Link href="/contact">
                  {content['howitworks.concierge.button']} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/10 p-8 rounded-sm backdrop-blur-sm border border-white/20"
            >
              <h3 className="text-xl font-medium mb-6">{content['howitworks.concierge.list.title']}</h3>
              <ul className="space-y-4">
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">1</div>
                  <span>{content['howitworks.concierge.list.item1']}</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">2</div>
                  <span>{content['howitworks.concierge.list.item2']}</span>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">3</div>
                  <span>{content['howitworks.concierge.list.item3']}</span>
                </motion.li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif mb-4">{content['howitworks.faq.title']}</h2>
            <p className="text-muted-foreground">
              {content['howitworks.faq.description']}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq: any, index: number) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Button asChild variant="outline" className="hover:scale-105 transition-transform">
              <Link href="/faq">{content['howitworks.faq.button']}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
